import { NextResponse } from "next/server";
import { createAutoSwapJob, getAutoSwapJobs, getCustomNetwork } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const clean = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";
export async function GET() { return NextResponse.json({ jobs: await getAutoSwapJobs() }); }
export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const networkId = Number(body.networkId); const tokenIn = clean(body.tokenIn, 128); const tokenOut = clean(body.tokenOut, 128); const amount = clean(body.amount, 48); const repeats = Number(body.repeats ?? 5); const cooldownSeconds = Number(body.cooldownSeconds ?? 3600); const slippageBps = Number(body.slippageBps ?? 50); const mode = body.mode === "live" ? "live" : "dry-run";
    if (!(await getCustomNetwork(networkId))) return NextResponse.json({ ok: false, error: "Custom network tidak ditemukan." }, { status: 400 });
    if (!tokenIn || !tokenOut || !/^\d+(\.\d+)?$/.test(amount) || Number(amount) <= 0) return NextResponse.json({ ok: false, error: "Token input, output, dan amount wajib valid." }, { status: 400 });
    if (repeats !== 5 || ![3600, 21600, 43200].includes(cooldownSeconds)) return NextResponse.json({ ok: false, error: "Untuk keamanan, job wajib 5 transaksi dengan cooldown 1, 6, atau 12 jam." }, { status: 400 });
    if (!Number.isInteger(slippageBps) || slippageBps < 0 || slippageBps > 1000) return NextResponse.json({ ok: false, error: "Slippage harus 0–1000 bps." }, { status: 400 });
    const job = await createAutoSwapJob({ networkId, tokenIn, tokenOut, amount, repeats: 5, cooldownSeconds: 3600, slippageBps, mode });
    return NextResponse.json({ ok: true, job }, { status: 201 });
  } catch (error) { return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Job auto-swap gagal dibuat." }, { status: 400 }); }
}
