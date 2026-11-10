#!/usr/bin/env node

import { ApiPromise, Keyring, WsProvider } from "@polkadot/api";
import { cryptoWaitReady } from "@polkadot/util-crypto";

const RPC = process.env.FLOP_RPC_WSS ?? "wss://rpc.devnet.flop.network";
const EXPECTED_GENESIS = "0x99c172c095340ace980631f9123544c6bebd4839f3437e463533422d8be2d631";
const DECIMALS = 18;
const SEND = process.argv.includes("--send");
const sourceUri = process.env.FLOP_SURI;
const recipient = process.env.FLOP_RECIPIENT;
const amountText = process.env.FLOP_AMOUNT ?? "0.001";
const keyType = process.env.FLOP_KEY_TYPE ?? "sr25519";

function die(message) { throw new Error(message); }

function toPlanck(value, decimals = DECIMALS) {
  if (!/^\d+(\.\d+)?$/.test(value)) die(`FLOP_AMOUNT tidak valid: ${value}`);
  const [whole, fraction = ""] = value.split(".");
  if (fraction.length > decimals) die(`FLOP_AMOUNT maksimal ${decimals} angka desimal.`);
  return BigInt(whole) * 10n ** BigInt(decimals) + BigInt((fraction + "0".repeat(decimals)).slice(0, decimals) || "0");
}

function formatPlanck(value, decimals = DECIMALS) {
  const negative = value < 0n;
  const absolute = negative ? -value : value;
  const raw = absolute.toString().padStart(decimals + 1, "0");
  const point = raw.length - decimals;
  return `${negative ? "-" : ""}${raw.slice(0, point)}.${raw.slice(point).replace(/0+$/, "") || "0"}`;
}

function unwrapDispatchError(api, dispatchError) {
  if (!dispatchError) return null;
  if (dispatchError.isModule) {
    const decoded = api.registry.findMetaError(dispatchError.asModule);
    return `${decoded.section}.${decoded.name}: ${decoded.docs.join(" ")}`;
  }
  return dispatchError.toString();
}

async function main() {
  if (SEND && !sourceUri) die("FLOP_SURI wajib diisi untuk --send. Jangan menaruhnya di source code atau repository.");
  if (!recipient) die("FLOP_RECIPIENT wajib diisi sebagai alamat SS58 tujuan.");
  const amount = toPlanck(amountText);
  await cryptoWaitReady();

  const provider = new WsProvider(RPC);
  const api = await ApiPromise.create({ provider, noInitWarn: true });
  try {
    const [chain, nodeName, nodeVersion, genesisHash, header] = await Promise.all([
      api.rpc.system.chain(),
      api.rpc.system.name(),
      api.rpc.system.version(),
      api.rpc.chain.getBlockHash(0),
      api.rpc.chain.getHeader(),
    ]);

    if (genesisHash.toHex().toLowerCase() !== EXPECTED_GENESIS.toLowerCase()) {
      die(`Genesis mismatch. Expected ${EXPECTED_GENESIS}, received ${genesisHash.toHex()}`);
    }

    console.log(`Network: ${chain.toString()}`);
    console.log(`Node: ${nodeName.toString()} ${nodeVersion.toString()}`);
    console.log(`RPC: ${RPC}`);
    console.log(`Genesis: ${genesisHash.toHex()} (verified)`);
    console.log(`Best block: #${header.number.toString()} ${header.hash.toHex()}`);
    console.log(`Transfer amount: ${amountText} FLOP (${amount.toString()} planck)`);

    if (!sourceUri) {
      console.log("Preflight chain check selesai. Set FLOP_SURI untuk saldo dan fee estimation.");
      return;
    }

    const keyring = new Keyring({ type: keyType, ss58Format: 42 });
    const sender = keyring.addFromUri(sourceUri);
    const senderAccount = await api.query.system.account(sender.address);
    const free = BigInt(senderAccount.data.free.toString());
    console.log(`Sender: ${sender.address}`);
    console.log(`Sender free balance: ${formatPlanck(free)} FLOP`);
    if (free < amount) die("Saldo free tidak cukup untuk nilai transfer sebelum fee.");

    const transfer = api.tx.balances.transferKeepAlive(recipient, amount);
    const payment = await transfer.paymentInfo(sender.address);
    const partialFee = BigInt(payment.partialFee.toString());
    console.log(`Estimated partial fee: ${formatPlanck(partialFee)} FLOP`);
    console.log(`Estimated total debit: ${formatPlanck(amount + partialFee)} FLOP`);

    if (!SEND) {
      console.log("DRY-RUN ONLY: tidak ada extrinsic yang dikirim. Tambahkan --send untuk mengirim setelah memeriksa output ini.");
      return;
    }

    if (process.env.CONFIRM_TRANSFER !== "I_UNDERSTAND_DEVNET_TRANSFER") {
      die("Transfer diblokir. Set CONFIRM_TRANSFER=I_UNDERSTAND_DEVNET_TRANSFER untuk konfirmasi eksplisit.");
    }

    console.log("Submitting signed transfer to FLOP Devnet…");
    await new Promise((resolve, reject) => {
      let settled = false;
      transfer.signAndSend(sender, ({ status, dispatchError, txHash }) => {
        const decodedError = unwrapDispatchError(api, dispatchError);
        if (decodedError) { settled = true; reject(new Error(decodedError)); return; }
        if (status.isInBlock) console.log(`Included in block: ${status.asInBlock.toHex()} (tx ${txHash.toHex()})`);
        if (status.isFinalized && !settled) { settled = true; console.log(`Finalized: ${status.asFinalized.toHex()}`); console.log(`Transaction hash: ${txHash.toHex()}`); resolve(); }
      }).catch(reject);
    });
  } finally {
    await api.disconnect();
  }
}

main().catch((error) => { console.error(`FLOP transfer failed: ${error instanceof Error ? error.message : String(error)}`); process.exitCode = 1; });
