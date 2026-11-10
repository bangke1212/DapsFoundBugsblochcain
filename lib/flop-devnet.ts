import { getIdentity } from "@/lib/technocore";

export const FLOP_EXPECTED_GENESIS = "0x99c172c095340ace980631f9123544c6bebd4839f3437e463533422d8be2d631";
export const FLOP_RPC_HTTP = process.env.FLOP_RPC_HTTP ?? "https://rpc.devnet.flop.network";
export const FLOP_RPC_WSS = process.env.FLOP_RPC_WSS ?? "wss://rpc.devnet.flop.network";
export const FLOP_FAUCET = "https://faucet.flop.network/chain";
export const FLOP_GATEWAY = process.env.FLOP_GATEWAY_URL ?? "https://api.flop.network";

async function jsonFetch(url: string, init?: RequestInit) { const response = await fetch(url, { ...init, cache: "no-store", signal: AbortSignal.timeout(12000) }); if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`); return response.json() as Promise<Record<string, unknown>>; }
async function rpc(method: string, params: unknown[]) { const body = await jsonFetch(FLOP_RPC_HTTP, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }) }); return body.result; }

export type FlopDevnetStatus = { connected: boolean; network: string; rpcHttp: string; rpcWss: string; faucet: string; gateway: string; genesis: string | null; expectedGenesis: string; genesisMatch: boolean; tokenSymbol: string | null; decimals: number | null; caip2: string | null; modelCount: number | null; did: string | null; agentReady: boolean; checkedAt: string; error?: string };

export async function verifyFlopDevnet(): Promise<FlopDevnetStatus> {
  const checkedAt = new Date().toISOString(); const did = getIdentity()?.did ?? null;
  try {
    const [chain, genesisResult, models] = await Promise.all([jsonFetch(FLOP_FAUCET), rpc("chain_getBlockHash", [0]), jsonFetch(`${FLOP_GATEWAY}/v1/models`)]);
    const genesis = typeof genesisResult === "string" ? genesisResult : null; const modelList = Array.isArray(models.data) ? models.data : [];
    const genesisMatch = genesis?.toLowerCase() === FLOP_EXPECTED_GENESIS.toLowerCase();
    return { connected: genesisMatch, network: String(chain.network ?? "devnet"), rpcHttp: FLOP_RPC_HTTP, rpcWss: FLOP_RPC_WSS, faucet: FLOP_FAUCET, gateway: FLOP_GATEWAY, genesis, expectedGenesis: FLOP_EXPECTED_GENESIS, genesisMatch, tokenSymbol: chain.tokenSymbol ? String(chain.tokenSymbol) : null, decimals: typeof chain.decimals === "number" ? chain.decimals : null, caip2: chain.caip2 ? String(chain.caip2) : null, modelCount: modelList.length, did, agentReady: Boolean(did && genesisMatch), checkedAt };
  } catch (error) {
    return { connected: false, network: "devnet", rpcHttp: FLOP_RPC_HTTP, rpcWss: FLOP_RPC_WSS, faucet: FLOP_FAUCET, gateway: FLOP_GATEWAY, genesis: null, expectedGenesis: FLOP_EXPECTED_GENESIS, genesisMatch: false, tokenSymbol: null, decimals: null, caip2: null, modelCount: null, did, agentReady: false, checkedAt, error: error instanceof Error ? error.message : "FLOP Devnet tidak dapat diverifikasi." };
  }
}
