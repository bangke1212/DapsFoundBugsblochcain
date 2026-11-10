import { NextResponse } from "next/server";
import { createCustomNetwork, getCustomNetworks } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clean(value: unknown, max: number) { return typeof value === "string" ? value.trim().slice(0, max) : ""; }
function validHttpUrl(value: string) { try { const url = new URL(value); return (url.protocol === "http:" || url.protocol === "https:") && !url.username && !url.password && !/[?&](token|key|secret|password)=/i.test(url.search); } catch { return false; } }

export async function GET() { return NextResponse.json({ networks: await getCustomNetworks() }); }
export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const name = clean(body.name, 128); const rpcUrl = clean(body.rpcUrl, 512); const nativeSymbol = clean(body.nativeSymbol, 24).toUpperCase(); const explorerUrl = clean(body.explorerUrl, 512); const routerAddress = clean(body.routerAddress, 128); const chainId = Number(body.chainId);
    if (!name || !rpcUrl || !Number.isInteger(chainId) || chainId <= 0 || chainId > 2147483647 || !nativeSymbol) return NextResponse.json({ ok: false, error: "Name, RPC URL, chain ID, dan symbol wajib valid." }, { status: 400 });
    if (!validHttpUrl(rpcUrl) || (explorerUrl && !validHttpUrl(explorerUrl))) return NextResponse.json({ ok: false, error: "RPC dan explorer harus berupa URL http(s) tanpa credential atau query secret." }, { status: 400 });
    const network = await createCustomNetwork({ name, rpcUrl, chainId, nativeSymbol, explorerUrl, routerAddress });
    return NextResponse.json({ ok: true, network }, { status: 201 });
  } catch (error) { return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Custom network gagal disimpan." }, { status: 400 }); }
}
