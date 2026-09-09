import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** Public list for dummy login picker */
export async function GET() {
  if (process.env.DEV_LOGIN_PICKER_ENABLED !== "true") return NextResponse.json({ error: "auth.unavailable" }, { status: 404 });
  try {
    const users = await prisma.user.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: { name: "asc" },
      select: { id: true, name: true, nameAr: true, role: true, email: true },
    });
    return NextResponse.json({ users });
  } catch (err) {
    console.error("[api/auth/users] DB error:", err);
    return NextResponse.json({ users: [], error: "auth.failed" }, { status: 500 });
  }
}
