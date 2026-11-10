import { NextResponse } from "next/server";
import { tickAutoSwapJobs } from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 30;
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const userAgent = request.headers.get("user-agent") ?? "";
  if (!userAgent.toLowerCase().includes("vercel-cron")) return NextResponse.json({ ok: false, error: "Endpoint hanya dapat dipanggil oleh Vercel Cron." }, { status: 403 });
  return NextResponse.json({ ok: true, jobs: await tickAutoSwapJobs() });
}
