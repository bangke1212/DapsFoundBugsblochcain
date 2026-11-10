import { NextResponse } from "next/server";
import { getAutoSwapExecutions, getAutoSwapJob, runAutoSwapOnce, updateAutoSwapJob } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) { const id = Number((await context.params).id); const job = await getAutoSwapJob(id); if (!job) return NextResponse.json({ ok: false, error: "Job tidak ditemukan." }, { status: 404 }); return NextResponse.json({ ok: true, job, executions: await getAutoSwapExecutions(id) }); }
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const id = Number((await context.params).id); const body = await request.json() as { action?: string }; const job = await getAutoSwapJob(id); if (!job) return NextResponse.json({ ok: false, error: "Job tidak ditemukan." }, { status: 404 });
  if (body.action === "run") return NextResponse.json({ ok: true, job: await runAutoSwapOnce(id), executions: await getAutoSwapExecutions(id) });
  if (body.action === "pause") return NextResponse.json({ ok: true, job: await updateAutoSwapJob(id, { status: "paused", nextRunAt: null }) });
  if (body.action === "resume") return NextResponse.json({ ok: true, job: await updateAutoSwapJob(id, { status: "armed", nextRunAt: new Date().toISOString() }) });
  if (body.action === "cancel") return NextResponse.json({ ok: true, job: await updateAutoSwapJob(id, { status: "cancelled", nextRunAt: null }) });
  return NextResponse.json({ ok: false, error: "Action tidak dikenal." }, { status: 400 });
}
