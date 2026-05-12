// CRITICAL: All queries use date >= from AND date < to (half-open).
// NEVER use BETWEEN or date <= to — that would exclude entries logged on the last day.

import { prisma } from "@/lib/prisma";
import { toRiyadhDateString } from "./timezone";
import { countWorkdays, getWorkdayDateStrings } from "./period";
import type { MetricResult, ReportConfig } from "./types";

interface QueryRange {
  userIds: string[];
  from: Date;
  to: Date;
}

export async function billableHoursRecorded({ userIds, from, to }: QueryRange): Promise<MetricResult> {
  const rows = await prisma.workLog.findMany({
    where: { userId: { in: userIds }, date: { gte: from, lt: to }, isBillable: true, deletedAt: null },
    select: { hours: true },
  });
  const value = rows.reduce((s, r) => s + r.hours, 0);
  return { value, formatted: `${value.toFixed(1)}h`, unit: "hours", drilldownAvailable: true };
}

export async function nonBillableHoursRecorded({ userIds, from, to }: QueryRange): Promise<MetricResult> {
  const rows = await prisma.workLog.findMany({
    where: { userId: { in: userIds }, date: { gte: from, lt: to }, isBillable: false, deletedAt: null },
    select: { hours: true },
  });
  const value = rows.reduce((s, r) => s + r.hours, 0);
  return { value, formatted: `${value.toFixed(1)}h`, unit: "hours", drilldownAvailable: true };
}

export async function billableRatio({ userIds, from, to }: QueryRange): Promise<MetricResult> {
  const rows = await prisma.workLog.findMany({
    where: { userId: { in: userIds }, date: { gte: from, lt: to }, deletedAt: null },
    select: { hours: true, isBillable: true },
  });
  const total = rows.reduce((s, r) => s + r.hours, 0);
  if (total === 0) return { value: null, formatted: "—", unit: "percent", drilldownAvailable: false };
  const billable = rows.filter((r) => r.isBillable).reduce((s, r) => s + r.hours, 0);
  const pct = (billable / total) * 100;
  return { value: pct, formatted: `${pct.toFixed(1)}%`, unit: "percent", drilldownAvailable: true };
}

export async function utilizationRate(
  { userIds, from, to }: QueryRange,
  config: Pick<ReportConfig, "workweekDays" | "standardHoursPerDay">
): Promise<MetricResult> {
  const workdays = countWorkdays(from, to, config.workweekDays);
  const capacity = workdays * config.standardHoursPerDay * userIds.length;
  if (capacity === 0) return { value: null, formatted: "—", unit: "percent", drilldownAvailable: false };
  const rows = await prisma.workLog.findMany({
    where: { userId: { in: userIds }, date: { gte: from, lt: to }, deletedAt: null },
    select: { hours: true },
  });
  const total = rows.reduce((s, r) => s + r.hours, 0);
  const pct = (total / capacity) * 100;
  return {
    value: pct,
    formatted: `${pct.toFixed(1)}%`,
    unit: "percent",
    drilldownAvailable: false,
    context: { capacityHours: capacity, loggedHours: total },
  };
}

export async function missingTimeEntries(
  { userIds, from, to }: QueryRange,
  config: Pick<ReportConfig, "workweekDays">
): Promise<MetricResult> {
  // CRITICAL: single query — no N+1 loop.
  // 1. Fetch all (userId, date) pairs that have at least one worklog
  const logs = await prisma.workLog.findMany({
    where: { userId: { in: userIds }, date: { gte: from, lt: to }, deletedAt: null },
    select: { userId: true, date: true },
  });

  // Build set of "userId:YYYY-MM-DD" keys that HAVE entries
  const covered = new Set<string>();
  for (const log of logs) {
    covered.add(`${log.userId}:${toRiyadhDateString(log.date)}`);
  }

  // Build expected grid: every userId × every workday
  const workdays = getWorkdayDateStrings(from, to, config.workweekDays);
  let missing = 0;
  for (const userId of userIds) {
    for (const day of workdays) {
      if (!covered.has(`${userId}:${day}`)) missing++;
    }
  }

  return { value: missing, formatted: `${missing}`, unit: "days", drilldownAvailable: false };
}

export async function lateEntries(
  { userIds, from, to }: QueryRange,
  config: Pick<ReportConfig, "lateEntryThresholdDays">
): Promise<MetricResult> {
  // Use raw SQL to compute Riyadh calendar day difference between work date and entry date.
  // CRITICAL: compare calendar days in Riyadh, not raw elapsed hours.
  const rows = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*)::bigint AS count
    FROM "WorkLog"
    WHERE "userId" = ANY(${userIds})
      AND date >= ${from}
      AND date < ${to}
      AND "deletedAt" IS NULL
      AND EXTRACT(EPOCH FROM (
        DATE_TRUNC('day', "createdAt" AT TIME ZONE 'Asia/Riyadh') -
        DATE_TRUNC('day', date AT TIME ZONE 'Asia/Riyadh')
      )) / 86400 > ${config.lateEntryThresholdDays}
  `;
  const count = Number(rows[0]?.count ?? 0);
  return { value: count, formatted: `${count}`, unit: "count", drilldownAvailable: true };
}
