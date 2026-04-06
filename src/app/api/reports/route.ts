import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, "viewHRReports")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const employeeId = searchParams.get("employeeId");
  const billable = searchParams.get("billable"); // "true" | "false" | null = all
  const report = searchParams.get("type") ?? "hr";

  // Date filter
  const dateFilter =
    from || to
      ? {
          date: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          },
        }
      : {};

  // Billable filter
  const billableFilter =
    billable === "true"
      ? { isBillable: true }
      : billable === "false"
        ? { isBillable: false }
        : {};

  // Scope: MANAGER sees only their team
  const teamFilter =
    user.role === "MANAGER" && user.teamId
      ? { user: { teamId: user.teamId } }
      : {};

  // Employee filter (only applied when user has broad access)
  const empFilter =
    employeeId && user.role !== "MANAGER" ? { userId: employeeId } : {};

  if (report === "hr") {
    const where = {
      ...dateFilter,
      ...billableFilter,
      ...teamFilter,
      ...empFilter,
    };

    // Fetch all matching logs with relations
    const logs = await prisma.workLog.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, nameAr: true, role: true, teamId: true } },
        case: { select: { id: true, caseNumber: true, title: true } },
        workType: { select: { name: true, nameAr: true } },
        client: { select: { name: true } },
      },
      orderBy: { date: "desc" },
    });

    // Aggregate per employee
    const byEmployee: Record<
      string,
      {
        userId: string;
        name: string;
        nameAr: string;
        role: string;
        totalHours: number;
        billableHours: number;
        nonBillableHours: number;
        cases: Set<string>;
        logs: typeof logs;
      }
    > = {};

    for (const log of logs) {
      const uid = log.userId;
      if (!byEmployee[uid]) {
        byEmployee[uid] = {
          userId: uid,
          name: log.user.name,
          nameAr: log.user.nameAr,
          role: log.user.role,
          totalHours: 0,
          billableHours: 0,
          nonBillableHours: 0,
          cases: new Set(),
          logs: [],
        };
      }
      byEmployee[uid].totalHours += log.hours;
      if (log.isBillable) byEmployee[uid].billableHours += log.hours;
      else byEmployee[uid].nonBillableHours += log.hours;
      if (log.case) byEmployee[uid].cases.add(log.case.caseNumber);
      byEmployee[uid].logs.push(log);
    }

    // Totals
    let totalHours = 0;
    let totalBillable = 0;
    let totalNonBillable = 0;

    const rows = Object.values(byEmployee).map((e) => {
      totalHours += e.totalHours;
      totalBillable += e.billableHours;
      totalNonBillable += e.nonBillableHours;
      return {
        userId: e.userId,
        name: e.name,
        nameAr: e.nameAr,
        role: e.role,
        totalHours: Math.round(e.totalHours * 100) / 100,
        billableHours: Math.round(e.billableHours * 100) / 100,
        nonBillableHours: Math.round(e.nonBillableHours * 100) / 100,
        billableRatio:
          e.totalHours > 0
            ? Math.round((e.billableHours / e.totalHours) * 1000) / 10
            : 0,
        casesCount: e.cases.size,
        caseNumbers: Array.from(e.cases),
        logs: e.logs.map((l) => ({
          id: l.id,
          date: l.date,
          hours: l.hours,
          isBillable: l.isBillable,
          workType: l.workType.name,
          workTypeAr: l.workType.nameAr,
          client: l.client.name,
          caseNumber: l.case?.caseNumber ?? "",
          caseTitle: l.case?.title ?? "",
          notes: l.notes,
        })),
      };
    });

    rows.sort((a, b) => b.totalHours - a.totalHours);

    return NextResponse.json({
      rows,
      totals: {
        totalHours: Math.round(totalHours * 100) / 100,
        billableHours: Math.round(totalBillable * 100) / 100,
        nonBillableHours: Math.round(totalNonBillable * 100) / 100,
        billableRatio:
          totalHours > 0
            ? Math.round((totalBillable / totalHours) * 1000) / 10
            : 0,
      },
    });
  }

  // Legacy report types kept for other pages
  if (report === "employee") {
    const logs = await prisma.workLog.groupBy({
      by: ["userId"],
      where: dateFilter,
      _sum: { hours: true },
    });
    const users = await prisma.user.findMany({
      where: { id: { in: logs.map((l) => l.userId) } },
    });
    return NextResponse.json({
      rows: logs.map((l) => ({
        userId: l.userId,
        totalHours: l._sum.hours ?? 0,
        user: users.find((u) => u.id === l.userId),
      })),
    });
  }

  if (report === "clientHours") {
    const logs = await prisma.workLog.groupBy({
      by: ["clientId"],
      where: dateFilter,
      _sum: { hours: true },
    });
    const clients = await prisma.client.findMany({
      where: { id: { in: logs.map((l) => l.clientId) } },
    });
    return NextResponse.json({
      rows: logs.map((l) => ({
        clientId: l.clientId,
        totalHours: l._sum.hours ?? 0,
        client: clients.find((c) => c.id === l.clientId),
      })),
    });
  }

  if (report === "overdueTasks") {
    const tasks = await prisma.task.findMany({
      where: { status: { not: "COMPLETED" }, dueDate: { lt: new Date() } },
      include: { assignedTo: true },
    });
    return NextResponse.json({ tasks });
  }

  return NextResponse.json({ ok: true });
}
