import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reportGuard, parseReportParams } from "@/lib/reports/route-guard";
import { buildPeriod } from "@/lib/reports/period";
import type { ReportPeriodPreset } from "@/lib/reports";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const { scope, period, customFrom, customTo, userId, departmentId } = parseReportParams(url);
  const metric = url.searchParams.get("metric") ?? "billableHours";

  const guard = await reportGuard(request, scope, userId, departmentId);
  if (!guard.ok) return guard.response;

  const cfg = await prisma.reportConfig.findUnique({ where: { id: "default" } });
  const workweekDays = cfg?.workweekDays ?? [0, 1, 2, 3, 4];
  const p = buildPeriod(period as ReportPeriodPreset, workweekDays, customFrom, customTo);
  const { userIds } = guard;

  const where = {
    userId: { in: userIds },
    date: { gte: p.utcFrom, lt: p.utcTo },
    deletedAt: null as null,
    ...(metric === "billableHours" ? { isBillable: true } : {}),
    ...(metric === "nonBillableHours" ? { isBillable: false } : {}),
  };

  const logs = await prisma.workLog.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, nameAr: true } },
      workType: { select: { name: true, nameAr: true } },
      case: { select: { caseNumber: true, title: true } },
      matter: { select: { matterNumber: true, title: true } },
      client: { select: { name: true, nameAr: true } },
    },
    orderBy: { date: "desc" },
    take: 500,
  });

  return NextResponse.json({ metric, logs, period: { from: p.from, to: p.to } });
}
