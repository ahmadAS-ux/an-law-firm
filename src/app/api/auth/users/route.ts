import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** Public list for dummy login picker */
export async function GET() {
  const users = await prisma.user.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, nameAr: true, role: true, email: true },
  });
  return NextResponse.json({ users });
}
