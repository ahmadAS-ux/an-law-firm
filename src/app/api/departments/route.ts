import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-permissions";
import { createAuditLog } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET() {
  const userOrErr = await requireUser();
  if (userOrErr instanceof Response) return userOrErr;

  const departments = await prisma.department.findMany({
    where: { deletedAt: null },
    include: {
      manager: { select: { id: true, name: true, nameAr: true } },
      users: { where: { isActive: true }, select: { id: true, name: true, nameAr: true, role: true } },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ departments });
}

export async function POST(request: NextRequest) {
  const userOrErr = await requireUser();
  if (userOrErr instanceof Response) return userOrErr;
  const user = userOrErr;

  if (user.role !== "PARTNER") {
    return NextResponse.json({ error: "Forbidden — Partner only" }, { status: 403 });
  }

  const { name, nameAr, managerId } = await request.json() as {
    name: string; nameAr: string; managerId?: string;
  };

  if (!name || !nameAr) {
    return NextResponse.json({ error: "name and nameAr are required" }, { status: 400 });
  }

  const dept = await prisma.department.create({
    data: { name, nameAr, managerId: managerId ?? null },
  });

  await createAuditLog(user.id, "CREATE", "Department", dept.id, { name }, null, "SYSTEM");
  return NextResponse.json({ department: dept }, { status: 201 });
}
