import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-permissions";
import { createAuditLog } from "@/lib/audit";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, ctx: Ctx) {
  const userOrErr = await requireUser();
  if (userOrErr instanceof Response) return userOrErr;
  const user = userOrErr;

  if (user.role !== "PARTNER") {
    return NextResponse.json({ error: "Forbidden — Partner only" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const body = await request.json() as { name?: string; nameAr?: string; managerId?: string | null };

  const dept = await prisma.department.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.nameAr !== undefined && { nameAr: body.nameAr }),
      ...(body.managerId !== undefined && { managerId: body.managerId }),
    },
  });

  await createAuditLog(user.id, "UPDATE", "Department", id, body, null, "SYSTEM");
  return NextResponse.json({ department: dept });
}

export async function DELETE(_request: NextRequest, ctx: Ctx) {
  const userOrErr = await requireUser();
  if (userOrErr instanceof Response) return userOrErr;
  const user = userOrErr;

  if (user.role !== "PARTNER") {
    return NextResponse.json({ error: "Forbidden — Partner only" }, { status: 403 });
  }

  const { id } = await ctx.params;
  await prisma.department.update({ where: { id }, data: { deletedAt: new Date() } });
  await createAuditLog(user.id, "DELETE", "Department", id, {}, null, "SYSTEM");
  return NextResponse.json({ ok: true });
}
