import type { NewIssue } from "@/lib/db";

function redact(value: string, max = 12000) {
  return value
    .replace(/ghp_[A-Za-z0-9_]+/g, "[REDACTED_GITHUB_TOKEN]")
    .replace(/github_pat_[A-Za-z0-9_]+/g, "[REDACTED_GITHUB_TOKEN]")
    .replace(/sk-[A-Za-z0-9_-]{12,}/g, "[REDACTED_API_KEY]")
    .replace(/(SIGN_SEED|PRIVATE_KEY|SECRET|BEARER)\s*[:=]\s*[^\s]+/gi, "$1=[REDACTED]")
    .replace(/-----BEGIN [^-]+-----[\s\S]*?-----END [^-]+-----/g, "[REDACTED_PRIVATE_KEY]")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
    .trim()
    .slice(0, max);
}

export function cleanIssueInput(value: unknown, fallback = "") {
  return redact(typeof value === "string" ? value : fallback);
}

export function buildIssueReport(input: NewIssue, createdAt = new Date().toISOString()) {
  const field = (label: string, value: string) => `${label}\n${redact(value || "Not provided")}\n`;
  return [
    "FLOP DEVNET SENTINEL — ISSUE REPORT",
    "====================================",
    "",
    `Report generated: ${createdAt}`,
    "Reporter: FLOP Devnet Sentinel",
    "Network: ${network}".replace("${network}", redact(input.network)),
    "",
    field("TITLE", input.title),
    field("SEVERITY", input.severity),
    field("CATEGORY", input.category),
    field("SUMMARY", input.summary),
    field("STEPS TO REPRODUCE", input.steps),
    field("EXPECTED RESULT", input.expected),
    field("ACTUAL RESULT", input.actual),
    field("IMPACT / RISK", input.impact),
    field("TRANSACTION HASH", input.txHash),
    field("REQUEST ID", input.requestId),
    field("ADDITIONAL NOTES", input.notes),
    "SAFETY NOTE",
    "This report was generated for responsible devnet testing. It intentionally excludes private keys, seeds, bearer tokens, and raw secrets. Submit security-sensitive findings privately through the project's official security channel.",
    "",
  ].join("\n");
}
