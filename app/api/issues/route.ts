import { NextRequest, NextResponse } from "next/server";
import { createIssue, getIssues, type IssueSeverity } from "@/lib/db";
import { buildIssueReport, cleanIssueInput } from "@/lib/issue-report";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const severities: IssueSeverity[] = ["critical", "high", "medium", "low", "informational"];

export async function GET() {
  return NextResponse.json({ ok: true, issues: await getIssues(50) });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const severity = cleanIssueInput(body.severity, "medium") as IssueSeverity;
    if (!severities.includes(severity)) throw new Error("Severity issue tidak valid.");
    const input = {
      title: cleanIssueInput(body.title),
      severity,
      category: cleanIssueInput(body.category, "other"),
      network: cleanIssueInput(body.network, "flop-devnet"),
      summary: cleanIssueInput(body.summary),
      steps: cleanIssueInput(body.steps),
      expected: cleanIssueInput(body.expected),
      actual: cleanIssueInput(body.actual),
      impact: cleanIssueInput(body.impact),
      txHash: cleanIssueInput(body.txHash),
      requestId: cleanIssueInput(body.requestId),
      notes: cleanIssueInput(body.notes),
    };
    if (!input.title || !input.summary || !input.actual) throw new Error("Judul, ringkasan, dan actual result wajib diisi.");
    const reportText = buildIssueReport(input);
    const issue = await createIssue(input, reportText);
    return NextResponse.json({ ok: true, issue });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Issue gagal disimpan." }, { status: 400 });
  }
}
