import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (hasPermission(user.role, "assignToAnyone")) {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, nameAr: true, role: true, teamId: true },
    });
    return NextResponse.json({ users });
  }

  if (hasPermission(user.role, "assignToTeam") && user.teamId) {
    const users = await prisma.user.findMany({
      where: { isActive: true, teamId: user.teamId },
      orderBy: { name: "asc" },
      select: { id: true, name: true, nameAr: true, role: true, teamId: true },
    });
    return NextResponse.json({ users });
  }

  return NextResponse.json({
    users: [
      {
        id: user.id,
        name: user.name,
        nameAr: user.nameAr,
        role: user.role,
        teamId: user.teamId,
      },
    ],
  });
}
