import { NextResponse } from "next/server";
import { verifyFlopDevnet } from "@/lib/flop-devnet";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const status = await verifyFlopDevnet();
  return NextResponse.json(status, { status: status.connected ? 200 : 502 });
}
