import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { createAuditLog } from "@/lib/audit";
import { Prisma } from "@prisma/client";

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

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const where: Prisma.TaskWhereInput = {};
  if (user.role === "EMPLOYEE") {
    where.assignedToId = user.id;
  }
  if (status) where.status = status;

  const tasks = await prisma.task.findMany({
    where,
    orderBy: { dueDate: "asc" },
    include: { case: { include: { client: true } }, assignedTo: true, createdBy: true },
  });
  return NextResponse.json({ tasks });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const requestedAssignee = String(body.assignedToId ?? user.id);
  const assignedToId = await resolveAssignee(
    user.id,
    user.role,
    user.teamId,
    requestedAssignee,
  );

  const t = await prisma.task.create({
    data: {
      title: String(body.title ?? "Task"),
      titleAr: String(body.titleAr ?? ""),
      description: String(body.description ?? ""),
      descriptionAr: String(body.descriptionAr ?? ""),
      status: String(body.status ?? "TODO"),
      priority: String(body.priority ?? "MEDIUM"),
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      caseId: body.caseId || null,
      assignedToId,
      createdById: user.id,
    },
  });

  await createAuditLog(user.id, "CREATE", "Task", t.id, { title: t.title });

  await prisma.notification.create({
    data: {
      userId: assignedToId,
      title: "New task assigned",
      titleAr: "تم تعيين مهمة جديدة",
      message: t.title,
      messageAr: t.titleAr || t.title,
      type: "TASK_ASSIGNED",
      link: `/tasks/${t.id}`,
    },
  });

  const full = await prisma.task.findUnique({
    where: { id: t.id },
    include: { case: true, assignedTo: true },
  });
  return NextResponse.json({ task: full });
}
