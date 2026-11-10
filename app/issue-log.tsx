"use client";

import { useEffect, useState } from "react";

type Issue = { id: number; title: string; severity: string; category: string; network: string; summary: string; actual: string; status: string; createdAt: string };

type FormState = { title: string; severity: string; category: string; network: string; summary: string; steps: string; expected: string; actual: string; impact: string; txHash: string; requestId: string; notes: string };

const initialForm: FormState = { title: "", severity: "medium", category: "rpc", network: "flop-devnet", summary: "", steps: "", expected: "", actual: "", impact: "", txHash: "", requestId: "", notes: "" };

function formatDate(value: string) {
  try { return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value)); } catch { return value; }
}

export default function IssueLog() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [form, setForm] = useState<FormState>(initialForm);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<"load" | "save" | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadIssues = async () => {
    setBusy("load");
    try { const response = await fetch("/api/issues", { cache: "no-store" }); const data = await response.json() as { issues?: Issue[] }; setIssues(data.issues ?? []); } finally { setBusy(null); }
  };
  useEffect(() => { void loadIssues(); }, []);

  const update = (key: keyof FormState, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const save = async () => {
    setBusy("save"); setNotice(null);
    try {
      const response = await fetch("/api/issues", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await response.json() as { ok?: boolean; error?: string; issue?: Issue };
      if (!response.ok || !data.ok) throw new Error(data.error ?? "Issue gagal disimpan.");
      setForm(initialForm); setOpen(false); setNotice(`Issue #${data.issue?.id ?? ""} tersimpan sebagai report TXT.`); await loadIssues();
    } catch (error) { setNotice(error instanceof Error ? error.message : "Issue gagal disimpan."); } finally { setBusy(null); }
  };

  const download = async (id: number) => {
    const response = await fetch(`/api/issues/${id}`);
    if (!response.ok) { setNotice("File report tidak ditemukan."); return; }
    const blob = await response.blob(); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `flop-issue-${id}.txt`; document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url);
  };

  return <section className="panel issue-panel" id="issues">
    <div className="panel-heading"><div><span className="eyebrow">05 / FINDINGS LOG</span><h3>Issue log &amp; reports</h3></div><span className="panel-code">TXT READY</span></div>
    <p className="panel-intro">Catat temuan devnet secara terstruktur. Isi report disimpan di database dan dapat diunduh sebagai `.txt` kapan saja.</p>
    <div className="issue-toolbar"><div className="issue-counter"><strong>{issues.length}</strong><span>saved findings</span></div><button className="primary-button" onClick={() => setOpen((value) => !value)}>{open ? "Close form" : "+ Log new issue"}</button></div>
    {notice && <div className="issue-notice" role="status">{notice}</div>}
    {open && <div className="issue-form">
      <div className="form-row"><label className="grow"><span className="field-label">TITLE *</span><input value={form.title} onChange={(event) => update("title", event.target.value)} placeholder="RPC returns stale block height" /></label><label><span className="field-label">SEVERITY</span><select value={form.severity} onChange={(event) => update("severity", event.target.value)}><option value="critical">Critical</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option><option value="informational">Informational</option></select></label></div>
      <div className="form-row"><label><span className="field-label">CATEGORY</span><select value={form.category} onChange={(event) => update("category", event.target.value)}><option value="rpc">RPC / API</option><option value="wallet">Wallet / nonce</option><option value="consensus">Consensus</option><option value="inference">Inference</option><option value="settlement">Settlement / HTLC</option><option value="bridge">Cross-chain</option><option value="other">Other</option></select></label><label className="grow"><span className="field-label">NETWORK</span><input value={form.network} onChange={(event) => update("network", event.target.value)} /></label></div>
      <label><span className="field-label">SUMMARY *</span><textarea value={form.summary} onChange={(event) => update("summary", event.target.value)} placeholder="Describe the finding in one or two paragraphs." /></label>
      <div className="form-row"><label className="grow"><span className="field-label">STEPS TO REPRODUCE</span><textarea value={form.steps} onChange={(event) => update("steps", event.target.value)} placeholder="1. Call...&#10;2. Submit...&#10;3. Observe..." /></label><label className="grow"><span className="field-label">EXPECTED RESULT</span><textarea value={form.expected} onChange={(event) => update("expected", event.target.value)} placeholder="What should happen?" /></label></div>
      <div className="form-row"><label className="grow"><span className="field-label">ACTUAL RESULT *</span><textarea value={form.actual} onChange={(event) => update("actual", event.target.value)} placeholder="What happened instead?" /></label><label className="grow"><span className="field-label">IMPACT / RISK</span><textarea value={form.impact} onChange={(event) => update("impact", event.target.value)} placeholder="Who is affected and how?" /></label></div>
      <div className="form-row"><label className="grow"><span className="field-label">TRANSACTION HASH</span><input value={form.txHash} onChange={(event) => update("txHash", event.target.value)} placeholder="Optional" /></label><label className="grow"><span className="field-label">REQUEST ID</span><input value={form.requestId} onChange={(event) => update("requestId", event.target.value)} placeholder="Optional" /></label></div>
      <label><span className="field-label">ADDITIONAL NOTES</span><textarea value={form.notes} onChange={(event) => update("notes", event.target.value)} placeholder="Version, timestamps, environment, or extra evidence." /></label>
      <div className="issue-form-footer"><span className="hint"><span className="mini-dot green" /> Private keys and tokens are redacted</span><button className="primary-button" onClick={() => void save()} disabled={busy !== null}>{busy === "save" ? "Saving report…" : "Save issue + report TXT"}</button></div>
    </div>}
    {issues.length === 0 ? <div className="issue-empty"><span>No findings saved yet.</span><small>Start a reproducible test and log the first issue here.</small></div> : <div className="issue-list">{issues.slice(0, 8).map((issue) => <div className="issue-row" key={issue.id}><div className={`severity-mark ${issue.severity}`} /><div className="issue-copy"><strong>#{issue.id} · {issue.title}</strong><span>{issue.category} · {issue.network} · {formatDate(issue.createdAt)}</span></div><span className={`issue-badge ${issue.severity}`}>{issue.severity}</span><button className="text-button" onClick={() => void download(issue.id)}>Download .txt</button></div>)}</div>}
  </section>;
}
