import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { createAuditLog } from "@/lib/audit";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const scope = searchParams.get("scope") ?? "mine";
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const userIdFilter = searchParams.get("userId");
  const clientId = searchParams.get("clientId");

  const where: Prisma.WorkLogWhereInput = {};
  if (from || to) {
    where.date = {};
    if (from) (where.date as { gte?: Date }).gte = new Date(from);
    if (to) (where.date as { lte?: Date }).lte = new Date(to);
  }
  if (clientId) where.clientId = clientId;

  if (scope === "mine" || user.role === "EMPLOYEE") {
    where.userId = user.id;
  } else if (userIdFilter && hasPermission(user.role, "approveWorkLogs")) {
    where.userId = userIdFilter;
  } else if (!hasPermission(user.role, "approveWorkLogs")) {
    where.userId = user.id;
  }

  const logs = await prisma.workLog.findMany({
    where,
    orderBy: { date: "desc" },
    take: 200,
    include: {
      user: true,
      client: true,
      case: true,
      workType: true,
      approvedBy: true,
    },
  });
  return NextResponse.json({ logs });
}

// TODO: Add Outlook calendar event creation here via Microsoft Graph API

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const clientId = String(body.clientId ?? "");
  const caseId = String(body.caseId ?? "");
  const workTypeId = String(body.workTypeId ?? "");
  const hours = Number(body.hours ?? 0);
  if (!clientId || !caseId || !workTypeId || !hours) {
    return NextResponse.json(
      { error: "clientId, caseId, workTypeId, hours required" },
      { status: 400 },
    );
  }

  const c = await prisma.case.findUnique({ where: { id: caseId } });
  if (!c || c.clientId !== clientId) {
    return NextResponse.json({ error: "Invalid case for client" }, { status: 400 });
  }

  const log = await prisma.workLog.create({
    data: {
      userId: user.id,
      clientId,
      caseId,
      workTypeId,
      hours,
      isBillable: Boolean(body.isBillable),
      date: body.date ? new Date(body.date) : new Date(),
      notes: String(body.notes ?? ""),
      notesAr: String(body.notesAr ?? ""),
    },
  });

  await createAuditLog(user.id, "CREATE", "WorkLog", log.id, { hours });

  const full = await prisma.workLog.findUnique({
    where: { id: log.id },
    include: { client: true, case: true, workType: true },
  });
  return NextResponse.json({ log: full });
}
