import { NextResponse } from "next/server";
import { getIssue } from "@/lib/db";
import { buildIssueMarkdown } from "@/lib/issue-report";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const issue = await getIssue(Number(id));
  if (!issue) return NextResponse.json({ ok: false, error: "Issue tidak ditemukan." }, { status: 404 });
  const markdown = new URL(request.url).searchParams.get("format") === "md";
  const extension = markdown ? "md" : "txt";
  const content = markdown ? buildIssueMarkdown(issue, issue.createdAt) : issue.reportText;
  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": `${markdown ? "text/markdown" : "text/plain"}; charset=utf-8`,
      "Content-Disposition": `attachment; filename="flop-issue-${issue.id}.${extension}"`,
      "Cache-Control": "no-store",
    },
  });
}
