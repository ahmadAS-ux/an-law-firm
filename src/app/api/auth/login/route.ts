import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const userId = body.userId as string | undefined;
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.isActive) {
    return NextResponse.json({ error: "Invalid user" }, { status: 401 });
  }
  const res = NextResponse.json({ user });
  res.cookies.set(AUTH_COOKIE_NAME, user.id, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
