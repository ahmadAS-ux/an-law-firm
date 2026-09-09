import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toClientUser } from "@/lib/auth";
import { AUTH_COOKIE_NAME, signSession, validSecret, secretMatches, SESSION_SECONDS } from "@/lib/session-token";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  if (process.env.DEV_LOGIN_PICKER_ENABLED !== "true") return NextResponse.json({ error: "auth.unavailable" }, { status: 404 });
  if (!validSecret(process.env.NEXTAUTH_SECRET)) {
    console.error("Session signing secret is missing or too short");
    return NextResponse.json({ error: "auth.unavailable" }, { status: 503 });
  }
  const body = await request.json().catch(() => null);
  if (!body || !await secretMatches(body.devSecret, process.env.DEV_LOGIN_SECRET)) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return NextResponse.json({ error: "auth.failed" }, { status: 401 });
  }
  if (typeof body.userId !== "string") return NextResponse.json({ error: "auth.failed" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: body.userId }, include: { dbRole: true } });
  if (!user?.isActive || user.deletedAt) return NextResponse.json({ error: "auth.failed" }, { status: 401 });
  const res = NextResponse.json({ user: toClientUser(user) });
  res.cookies.set(AUTH_COOKIE_NAME, await signSession(user.id, process.env.NEXTAUTH_SECRET), {
    httpOnly: true, path: "/", sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: SESSION_SECONDS,
  });
  return res;
}
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE_NAME, "", { httpOnly: true, path: "/", sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 0 });
  return res;
}
