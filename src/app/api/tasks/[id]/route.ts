import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { createAuditLog } from "@/lib/audit";

type Ctx = { params: Promise<{ id: string }> };

async function resolveAssignee(
  actorId: string,
  role: string,
  teamId: string | null,
  requestedId: string,
) {
  if (hasPermission(role, "assignToAnyone")) {
    return requestedId;
  }
  if (hasPermission(role, "assignToTeam") && teamId) {
    const u = await prisma.user.findUnique({ where: { id: requestedId } });
    if (u?.teamId === teamId) return requestedId;
    return actorId;
  }
  return actorId;
}

export async function GET(_request: Request, ctx: Ctx) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const t = await prisma.task.findUnique({
    where: { id },
    include: { case: true, assignedTo: true, createdBy: true },
  });
  if (!t) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (user.role === "EMPLOYEE" && t.assignedToId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json({ task: t });
}

export async function PATCH(request: Request, ctx: Ctx) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const prev = await prisma.task.findUnique({ where: { id } });
  if (!prev) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (user.role === "EMPLOYEE" && prev.assignedToId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  let assignedToId = prev.assignedToId;
  if (body.assignedToId) {
    assignedToId = await resolveAssignee(
      user.id,
      user.role,
      user.teamId,
      String(body.assignedToId),
    );
  }

  const status = body.status ?? prev.status;
  const completedAt =
    status === "COMPLETED" ? new Date() : prev.completedAt;

  const t = await prisma.task.update({
    where: { id },
    data: {
      title: body.title ?? prev.title,
      titleAr: body.titleAr ?? prev.titleAr,
      description: body.description ?? prev.description,
      descriptionAr: body.descriptionAr ?? prev.descriptionAr,
      status,
      priority: body.priority ?? prev.priority,
      dueDate:
        body.dueDate !== undefined
          ? body.dueDate
            ? new Date(body.dueDate)
            : null
          : prev.dueDate,
      caseId: body.caseId !== undefined ? body.caseId : prev.caseId,
      assignedToId,
      completedAt: status === "COMPLETED" ? completedAt : null,
    },
  });

  await createAuditLog(user.id, "UPDATE", "Task", t.id, { before: prev, after: t });

  if (assignedToId !== prev.assignedToId) {
    await prisma.notification.create({
      data: {
        userId: assignedToId,
        title: "New task assigned",
        titleAr: "تم تعيين مهمة جديدة",
        message: t.title,
        messageAr: t.titleAr,
        type: "TASK_ASSIGNED",
        link: `/tasks/${t.id}`,
      },
    });
  }

  return NextResponse.json({ task: t });
}
