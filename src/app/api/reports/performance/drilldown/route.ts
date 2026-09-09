import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reportGuard, parseReportParams } from "@/lib/reports/route-guard";
import { buildPeriod } from "@/lib/reports/period";
import { riyadhToday } from "@/lib/reports/timezone";
import type { ReportPeriodPreset } from "@/lib/reports";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const { scope, period, customFrom, customTo, userId, departmentId } = parseReportParams(url);
  const metric = url.searchParams.get("metric") ?? "mattersWorkedOn";

  const guard = await reportGuard(request, scope, userId, departmentId);
  if (!guard.ok) return guard.response;

  const cfg = await prisma.reportConfig.findUnique({ where: { id: "default" } });
  const workweekDays = cfg?.workweekDays ?? [0, 1, 2, 3, 4];
  const p = buildPeriod(period as ReportPeriodPreset, workweekDays, customFrom, customTo);
  const { userIds } = guard;

  if (metric === "mattersWorkedOn") {
    const logs = await prisma.workLog.findMany({
      where: { userId: { in: userIds }, date: { gte: p.utcFrom, lt: p.utcTo }, deletedAt: null },
      include: {
        case: { select: { caseNumber: true, title: true, titleAr: true } },
        matter: { select: { matterNumber: true, title: true, titleAr: true } },
        user: { select: { name: true, nameAr: true } },
      },
      orderBy: { date: "desc" },
      take: 500,
    });
    return NextResponse.json({ metric, logs, period: { from: p.from, to: p.to } });
  }

  if (metric === "tasksCompleted") {
    const tasks = await prisma.task.findMany({
      where: {
        assignedToId: { in: userIds },
        status: "COMPLETED",
        completedAt: { gte: p.utcFrom, lt: p.utcTo },
      },
      include: { assignedTo: { select: { name: true, nameAr: true } } },
      orderBy: { completedAt: "desc" },
      take: 500,
    });
    return NextResponse.json({ metric, tasks, period: { from: p.from, to: p.to } });
  }

  if (metric === "overdueTasks") {
    const today = riyadhToday();
    const tasks = await prisma.task.findMany({
      where: {
        assignedToId: { in: userIds },
        dueDate: { lt: today },
        status: { notIn: ["COMPLETED", "CANCELLED"] },
      },
      include: { assignedTo: { select: { name: true, nameAr: true } } },
      orderBy: { dueDate: "asc" },
      take: 500,
    });
    return NextResponse.json({ metric, tasks });
  }

  if (metric === "openMatterLoad") {
    const [cases, matters] = await Promise.all([
      prisma.case.findMany({
        where: { assignedToId: { in: userIds }, status: { in: ["OPEN", "ACTIVE"] }, deletedAt: null },
        include: { assignedTo: { select: { name: true, nameAr: true } }, client: { select: { name: true } } },
        take: 500,
      }),
      prisma.matter.findMany({
        where: { assignedToId: { in: userIds }, status: { in: ["ACTIVE", "PENDING_APPROVAL"] }, deletedAt: null },
        include: { assignedTo: { select: { name: true, nameAr: true } }, client: { select: { name: true } } },
        take: 500,
      }),
    ]);
    return NextResponse.json({ metric, cases, matters });
  }

  return NextResponse.json({ metric, data: [] });
}
