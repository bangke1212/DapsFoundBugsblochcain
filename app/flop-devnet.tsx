"use client";

import { useEffect, useState } from "react";

type Status = { connected: boolean; network: string; rpcHttp: string; rpcWss: string; gateway: string; genesis: string | null; expectedGenesis: string; genesisMatch: boolean; tokenSymbol: string | null; decimals: number | null; caip2: string | null; modelCount: number | null; did: string | null; agentReady: boolean; checkedAt: string; error?: string };

function short(value: string | null, left = 10, right = 8) { if (!value) return "—"; return value.length > left + right + 3 ? `${value.slice(0, left)}…${value.slice(-right)}` : value; }

export default function FlopDevnetPanel() {
  const [status, setStatus] = useState<Status | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function verify() {
    setBusy(true); setError("");
    try { const response = await fetch("/api/flop/status", { cache: "no-store" }); const data = await response.json(); setStatus(data); if (!response.ok) setError(data.error ?? "Devnet belum dapat diverifikasi."); }
    catch { setError("Endpoint verifikasi tidak dapat dihubungi."); }
    finally { setBusy(false); }
  }

  useEffect(() => { void verify(); }, []);

  return <section className="panel flop-devnet-panel" id="flop-devnet">
    <div className="panel-heading"><div><p className="eyebrow">FLOP NETWORK / DEVNET</p><h2>Devnet connection</h2><p className="muted">Verifikasi server-side ke RPC dan gateway resmi. Tidak ada seed yang dikirim ke browser.</p></div><span className={`status-pill ${status?.connected ? "status-good" : "status-warn"}`}><i />{status?.connected ? "Verified" : "Not verified"}</span></div>
    <div className="flop-metrics">
      <div><span>Agent identity</span><strong>{status?.agentReady ? "Ready for FLOP" : status?.did ? "DID loaded" : "Setup required"}</strong><small>{short(status?.did ?? null, 12, 8)}</small></div>
      <div><span>Chain identity</span><strong>{status?.genesisMatch ? "Genesis matched" : "Waiting"}</strong><small>{short(status?.genesis ?? null, 12, 8)}</small></div>
      <div><span>Gateway models</span><strong>{status?.modelCount ?? "—"}</strong><small>public catalog</small></div>
    </div>
    <div className="endpoint-list"><div><span>RPC / HTTP</span><code>{status?.rpcHttp ?? "https://rpc.devnet.flop.network"}</code></div><div><span>RPC / WebSocket</span><code>{status?.rpcWss ?? "wss://rpc.devnet.flop.network"}</code></div><div><span>CAIP-2</span><code>{status?.caip2 ?? "polkadot:99c172c095340ace980631f9123544c6"}</code></div></div>
    <div className="panel-actions"><button className="button button-primary" onClick={verify} disabled={busy}>{busy ? "Verifying…" : "Verify FLOP devnet"}</button><span className="muted small">{status?.checkedAt ? `Checked ${new Date(status.checkedAt).toLocaleTimeString()}` : "Belum diverifikasi"}</span></div>
    {(error || status?.error) && <div className="inline-warning">{error || status?.error}</div>}
    <p className="security-note"><strong>Catatan sign-in:</strong> FLOP belum menerbitkan endpoint login publik terpisah. Panel ini memverifikasi devnet dan menyiapkan DID server. Signed check-in Technocore tetap berbeda dari transaksi atau login on-chain FLOP.</p>
  </section>;
}
