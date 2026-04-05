import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { createAuditLog } from "@/lib/audit";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const prev = await prisma.workLog.findUnique({ where: { id } });
  if (!prev) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));

  if (body.isApproved !== undefined) {
    if (!hasPermission(user.role, "approveWorkLogs")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const log = await prisma.workLog.update({
      where: { id },
      data: {
        isApproved: Boolean(body.isApproved),
        approvedById: body.isApproved ? user.id : null,
      },
    });
    await createAuditLog(user.id, "APPROVE", "WorkLog", id, {
      isApproved: log.isApproved,
    });
    if (log.userId) {
      await prisma.notification.create({
        data: {
          userId: log.userId,
          title: "Work log updated",
          titleAr: "تحديث سجل عمل",
          message: `Approval: ${log.isApproved}`,
          messageAr: `الاعتماد: ${log.isApproved}`,
          type: "GENERAL",
          link: "/work-logs/my-logs",
        },
      });
    }
    return NextResponse.json({ log });
  }

  if (prev.isApproved) {
    return NextResponse.json({ error: "Cannot edit approved log" }, { status: 400 });
  }
  if (prev.userId !== user.id && !hasPermission(user.role, "approveWorkLogs")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const log = await prisma.workLog.update({
    where: { id },
    data: {
      hours: body.hours ?? prev.hours,
      isBillable: body.isBillable ?? prev.isBillable,
      date: body.date ? new Date(body.date) : prev.date,
      notes: body.notes ?? prev.notes,
      notesAr: body.notesAr ?? prev.notesAr,
      workTypeId: body.workTypeId ?? prev.workTypeId,
    },
  });
  await createAuditLog(user.id, "UPDATE", "WorkLog", id, { before: prev, after: log });
  return NextResponse.json({ log });
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const prev = await prisma.workLog.findUnique({ where: { id } });
  if (!prev) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (prev.isApproved) {
    return NextResponse.json({ error: "Cannot delete approved" }, { status: 400 });
  }
  if (prev.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await prisma.workLog.delete({ where: { id } });
  await createAuditLog(user.id, "DELETE", "WorkLog", id, {});
  return NextResponse.json({ ok: true });
}
