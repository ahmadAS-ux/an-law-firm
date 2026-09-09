import { NextResponse } from "next/server";
import { getCurrentUser, toClientUser } from "@/lib/auth";
export const dynamic = "force-dynamic";
export async function GET() {
  const user = await getCurrentUser();
  return user ? NextResponse.json({ user: toClientUser(user) }, { headers: { "Cache-Control": "private, no-store" } }) : NextResponse.json({ error: "auth.failed" }, { status: 401 });
}
