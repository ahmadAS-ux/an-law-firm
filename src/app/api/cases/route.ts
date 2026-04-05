import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { createAuditLog } from "@/lib/audit";
import { Prisma } from "@prisma/client";

async function nextCaseNumber(): Promise<string> {
  const rows = await prisma.case.findMany({ select: { caseNumber: true } });
  let max = 0;
  for (const r of rows) {
    const p = r.caseNumber.match(/AN-2026-(\d+)/);
    if (p) max = Math.max(max, parseInt(p[1], 10));
  }
  return `AN-2026-${String(max + 1).padStart(4, "0")}`;
}

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const clientId = searchParams.get("clientId");
  const assignedToId = searchParams.get("assignedToId");

  const where: Prisma.CaseWhereInput = {};
  if (user.role === "EMPLOYEE") {
    where.assignedToId = user.id;
  }
  if (search) {
    where.OR = [
      { caseNumber: { contains: search } },
      { title: { contains: search } },
      { titleAr: { contains: search } },
    ];
  }
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (clientId) where.clientId = clientId;
  if (assignedToId && hasPermission(user.role, "viewAllClients")) {
    where.assignedToId = assignedToId;
  }

  const cases = await prisma.case.findMany({
    where,
    orderBy: { openDate: "desc" },
    include: { client: true, assignedTo: true, createdBy: true },
  });
  return NextResponse.json({ cases });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, "createClientCase")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await request.json().catch(() => ({}));
  const clientId = String(body.clientId ?? "");
  if (!clientId) {
    return NextResponse.json({ error: "clientId required" }, { status: 400 });
  }

  let assignedToId = String(body.assignedToId ?? user.id);
  if (!hasPermission(user.role, "assignToAnyone")) {
    if (hasPermission(user.role, "assignToTeam") && user.teamId) {
      const assignee = await prisma.user.findUnique({
        where: { id: assignedToId },
      });
      if (!assignee || assignee.teamId !== user.teamId) {
        assignedToId = user.id;
      }
    } else {
      assignedToId = user.id;
    }
  }

  const caseNumber = await nextCaseNumber();
  const c = await prisma.case.create({
    data: {
      caseNumber,
      title: String(body.title ?? "Untitled"),
      titleAr: String(body.titleAr ?? ""),
      description: String(body.description ?? ""),
      descriptionAr: String(body.descriptionAr ?? ""),
      status: String(body.status ?? "OPEN"),
      priority: String(body.priority ?? "MEDIUM"),
      openDate: body.openDate ? new Date(body.openDate) : new Date(),
      closeDate: body.closeDate ? new Date(body.closeDate) : null,
      clientId,
      assignedToId,
      createdById: user.id,
    },
  });

  await createAuditLog(user.id, "CREATE", "Case", c.id, { caseNumber });

  const full = await prisma.case.findUnique({
    where: { id: c.id },
    include: { client: true, assignedTo: true },
  });
  return NextResponse.json({ case: full });
}
