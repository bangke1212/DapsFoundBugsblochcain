import { NextResponse } from "next/server";
import { getIssue } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const issue = await getIssue(Number(id));
  if (!issue) return NextResponse.json({ ok: false, error: "Issue tidak ditemukan." }, { status: 404 });
  return new NextResponse(issue.reportText, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="flop-issue-${issue.id}.txt"`,
      "Cache-Control": "no-store",
    },
  });
}
