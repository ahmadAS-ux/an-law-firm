// CRITICAL: All queries use date >= from AND date < to (half-open).

import { prisma } from "@/lib/prisma";
import { riyadhToday } from "./timezone";
import { countDistinctMatters } from "./matter-key";
import type { MetricResult } from "./types";

interface QueryRange {
  userIds: string[];
  from: Date;
  to: Date;
}

export async function billableHoursByUser(
  { userIds, from, to }: QueryRange
): Promise<Array<{ userId: string; hours: number }>> {
  const logs = await prisma.workLog.findMany({
    where: { userId: { in: userIds }, date: { gte: from, lt: to }, isBillable: true, deletedAt: null },
    select: { userId: true, hours: true },
  });
  const map = new Map<string, number>();
  for (const log of logs) map.set(log.userId, (map.get(log.userId) ?? 0) + log.hours);
  return Array.from(map.entries())
    .map(([userId, hours]) => ({ userId, hours }))
    .sort((a, b) => b.hours - a.hours);
}

export async function mattersWorkedOn({ userIds, from, to }: QueryRange): Promise<MetricResult> {
  const logs = await prisma.workLog.findMany({
    where: { userId: { in: userIds }, date: { gte: from, lt: to }, deletedAt: null },
    select: { caseId: true, matterId: true },
  });
  const count = countDistinctMatters(logs);
  return { value: count, formatted: `${count}`, unit: "count", drilldownAvailable: true };
}

export async function openMatterLoad({ userIds }: Pick<QueryRange, "userIds">): Promise<MetricResult> {
  const [cases, matters] = await Promise.all([
    prisma.case.findMany({
      where: { assignedToId: { in: userIds }, status: { in: ["OPEN", "ACTIVE"] }, deletedAt: null },
      select: { id: true },
    }),
    prisma.matter.findMany({
      where: { assignedToId: { in: userIds }, status: { in: ["ACTIVE", "PENDING_APPROVAL"] }, deletedAt: null },
      select: { id: true },
    }),
  ]);
  const count = cases.length + matters.length;
  return { value: count, formatted: `${count}`, unit: "count", drilldownAvailable: true };
}

export async function mattersClosedInPeriod({ userIds, from, to }: QueryRange): Promise<MetricResult> {
  // Case uses closeDate (not closedAt — schema gap from v1)
  // Matter has no completedAt — use status = COMPLETED instead with approvedAt as proxy
  const [cases, matters] = await Promise.all([
    prisma.case.findMany({
      where: {
        assignedToId: { in: userIds },
        closeDate: { gte: from, lt: to },
        deletedAt: null,
      },
      select: { id: true },
    }),
    prisma.matter.findMany({
      where: {
        assignedToId: { in: userIds },
        status: "COMPLETED",
        approvedAt: { gte: from, lt: to },
        deletedAt: null,
      },
      select: { id: true },
    }),
  ]);
  const count = cases.length + matters.length;
  return { value: count, formatted: `${count}`, unit: "count", drilldownAvailable: true };
}

export async function avgHoursPerMatter({ userIds, from, to }: QueryRange): Promise<MetricResult> {
  const logs = await prisma.workLog.findMany({
    where: { userId: { in: userIds }, date: { gte: from, lt: to }, deletedAt: null },
    select: { caseId: true, matterId: true, hours: true },
  });
  const matterCount = countDistinctMatters(logs);
  if (matterCount === 0) return { value: null, formatted: "—", unit: "hours", drilldownAvailable: false };
  const total = logs.reduce((s, r) => s + r.hours, 0);
  const avg = total / matterCount;
  return { value: avg, formatted: `${avg.toFixed(1)}h`, unit: "hours", drilldownAvailable: false };
}

export async function tasksCompleted({ userIds, from, to }: QueryRange): Promise<MetricResult> {
  const [completed, active] = await Promise.all([
    prisma.task.count({
      where: {
        assignedToId: { in: userIds },
        status: "COMPLETED",
        completedAt: { gte: from, lt: to },
      },
    }),
    prisma.task.count({
      where: {
        assignedToId: { in: userIds },
        status: { in: ["TODO", "IN_PROGRESS"] },
        createdAt: { gte: from, lt: to },
      },
    }),
  ]);
  const total = completed + active;
  const rate = total > 0 ? (completed / total) * 100 : null;
  return {
    value: completed,
    formatted: `${completed}`,
    unit: "count",
    drilldownAvailable: true,
    context: { completionRate: rate !== null ? Number(rate.toFixed(1)) : null, totalInPeriod: total },
  };
}

export async function overdueTasks({ userIds }: Pick<QueryRange, "userIds">): Promise<MetricResult> {
  const today = riyadhToday(); // CRITICAL: Riyadh calendar today, not server UTC now()
  const count = await prisma.task.count({
    where: {
      assignedToId: { in: userIds },
      dueDate: { lt: today },
      status: { notIn: ["COMPLETED", "CANCELLED"] },
    },
  });
  return { value: count, formatted: `${count}`, unit: "count", drilldownAvailable: true };
}
