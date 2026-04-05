import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { createAuditLog } from "@/lib/audit";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const c = await prisma.case.findUnique({
    where: { id },
    include: {
      client: true,
      assignedTo: true,
      createdBy: true,
      tasks: { include: { assignedTo: true } },
      workLogs: {
        take: 50,
        orderBy: { date: "desc" },
        include: { user: true, workType: true },
      },
      files: { orderBy: { createdAt: "desc" }, take: 50 },
    },
  });
  if (!c) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (user.role === "EMPLOYEE" && c.assignedToId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const audits = await prisma.auditLog.findMany({
    where: { entityType: "Case", entityId: id },
    orderBy: { createdAt: "desc" },
    take: 30,
    include: { user: true },
  });

  return NextResponse.json({ case: c, audits });
}

export async function PUT(request: Request, ctx: Ctx) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const prev = await prisma.case.findUnique({ where: { id } });
  if (!prev) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (user.role === "EMPLOYEE" && prev.assignedToId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  let assignedToId = body.assignedToId ?? prev.assignedToId;
  if (!hasPermission(user.role, "assignToAnyone")) {
    if (hasPermission(user.role, "assignToTeam") && user.teamId) {
      const assignee = await prisma.user.findUnique({
        where: { id: assignedToId },
      });
      if (!assignee || assignee.teamId !== user.teamId) {
        assignedToId = prev.assignedToId;
      }
    } else {
      assignedToId = prev.assignedToId;
    }
  }

  const statusChanged =
    body.status && body.status !== prev.status ? String(body.status) : null;

  const c = await prisma.case.update({
    where: { id },
    data: {
      title: body.title ?? prev.title,
      titleAr: body.titleAr ?? prev.titleAr,
      description: body.description ?? prev.description,
      descriptionAr: body.descriptionAr ?? prev.descriptionAr,
      status: body.status ?? prev.status,
      priority: body.priority ?? prev.priority,
      closeDate:
        body.closeDate !== undefined
          ? body.closeDate
            ? new Date(body.closeDate)
            : null
          : prev.closeDate,
      assignedToId,
    },
  });

  await createAuditLog(user.id, "UPDATE", "Case", c.id, { before: prev, after: c });

  if (statusChanged && c.assignedToId) {
    await prisma.notification.create({
      data: {
        userId: c.assignedToId,
        title: "Case status updated",
        titleAr: "تم تحديث حالة القضية",
        message: `Case ${c.caseNumber} is now ${c.status}`,
        messageAr: `القضية ${c.caseNumber} أصبحت ${c.status}`,
        type: "CASE_STATUS_CHANGE",
        link: `/cases/${c.id}`,
      },
    });
  }

  return NextResponse.json({ case: c });
}
