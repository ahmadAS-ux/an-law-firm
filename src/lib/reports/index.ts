import { prisma } from "@/lib/prisma";
import { buildPeriod } from "./period";
import { resolveReportScope, enforceUserIdInScope, buildPermissionSnapshot } from "./permissions";
import {
  billableHoursRecorded,
  nonBillableHoursRecorded,
  billableRatio,
  utilizationRate,
  missingTimeEntries,
  lateEntries,
} from "./utilization";
import {
  billableHoursByUser,
  mattersWorkedOn,
  openMatterLoad,
  mattersClosedInPeriod,
  avgHoursPerMatter,
  tasksCompleted,
  overdueTasks,
} from "./performance";
import type {
  ReportScope,
  ReportPeriodPreset,
  ReportFilters,
  MetricResult,
  ReportUser,
  ReportConfig as ReportConfigType,
} from "./types";

export * from "./types";
export * from "./timezone";
export * from "./matter-key";
export * from "./permissions";
export * from "./period";

export interface UtilizationReportResult {
  period: { from: string; to: string; label: string; labelAr: string };
  scope: ReportScope;
  userCount: number;
  metrics: {
    billableHours: MetricResult;
    nonBillableHours: MetricResult;
    billableRatio: MetricResult;
    utilizationRate: MetricResult;
    missingEntries: MetricResult;
    lateEntries: MetricResult;
  };
  breakdown: Array<{ userId: string; hours: number }>;
}

export interface PerformanceReportResult {
  period: { from: string; to: string; label: string; labelAr: string };
  scope: ReportScope;
  userCount: number;
  metrics: {
    mattersWorkedOn: MetricResult;
    openMatterLoad: MetricResult;
    mattersClosed: MetricResult;
    avgHoursPerMatter: MetricResult;
    tasksCompleted: MetricResult;
    overdueTasks: MetricResult;
  };
  breakdown: Array<{ userId: string; hours: number }>;
}

async function getReportConfig(): Promise<ReportConfigType> {
  const cfg = await prisma.reportConfig.findUnique({ where: { id: "default" } });
  return {
    workweekDays:           cfg?.workweekDays ?? [0, 1, 2, 3, 4],
    standardHoursPerDay:    cfg ? Number(cfg.standardHoursPerDay) : 8,
    targetHoursPartner:     cfg ? Number(cfg.targetHoursPartner) : 100,
    targetHoursManager:     cfg ? Number(cfg.targetHoursManager) : 120,
    targetHoursEmployee:    cfg ? Number(cfg.targetHoursEmployee) : 140,
    targetHoursAdminStaff:  cfg ? Number(cfg.targetHoursAdminStaff) : 0,
    targetHoursAccountant:  cfg ? Number(cfg.targetHoursAccountant) : 0,
    lateEntryThresholdDays: cfg?.lateEntryThresholdDays ?? 2,
  };
}

export async function getUtilizationReport(
  currentUser: Pick<ReportUser, "id" | "departmentId">,
  scope: ReportScope,
  periodPreset: ReportPeriodPreset,
  filters?: ReportFilters,
  customFrom?: string,
  customTo?: string
): Promise<UtilizationReportResult | { error: string; status: number }> {
  const permissions = await buildPermissionSnapshot(currentUser.id);
  const user: ReportUser = { ...currentUser, roleName: "", permissions };

  const cfg = await getReportConfig();
  const period = buildPeriod(periodPreset, cfg.workweekDays, customFrom, customTo);

  const scopeResult = await resolveReportScope(user, scope, filters?.departmentId);
  if (!scopeResult.allowed) return { error: scopeResult.reason ?? "Forbidden", status: 403 };

  const userResult = enforceUserIdInScope(scopeResult.userIds, filters?.userId);
  if (!userResult.allowed) return { error: "User out of scope", status: 403 };

  const { userIds } = userResult;
  const range = { userIds, from: period.utcFrom, to: period.utcTo };

  const [bh, nbh, br, ur, me, le, byUser] = await Promise.all([
    billableHoursRecorded(range),
    nonBillableHoursRecorded(range),
    billableRatio(range),
    utilizationRate(range, cfg),
    missingTimeEntries(range, cfg),
    lateEntries(range, cfg),
    billableHoursByUser(range),
  ]);

  return {
    period: { from: period.from, to: period.to, label: period.label, labelAr: period.labelAr },
    scope,
    userCount: userIds.length,
    metrics: {
      billableHours: bh,
      nonBillableHours: nbh,
      billableRatio: br,
      utilizationRate: ur,
      missingEntries: me,
      lateEntries: le,
    },
    breakdown: byUser,
  };
}

export async function getPerformanceReport(
  currentUser: Pick<ReportUser, "id" | "departmentId">,
  scope: ReportScope,
  periodPreset: ReportPeriodPreset,
  filters?: ReportFilters,
  customFrom?: string,
  customTo?: string
): Promise<PerformanceReportResult | { error: string; status: number }> {
  const permissions = await buildPermissionSnapshot(currentUser.id);
  const user: ReportUser = { ...currentUser, roleName: "", permissions };

  const cfg = await getReportConfig();
  const period = buildPeriod(periodPreset, cfg.workweekDays, customFrom, customTo);

  const scopeResult = await resolveReportScope(user, scope, filters?.departmentId);
  if (!scopeResult.allowed) return { error: scopeResult.reason ?? "Forbidden", status: 403 };

  const userResult = enforceUserIdInScope(scopeResult.userIds, filters?.userId);
  if (!userResult.allowed) return { error: "User out of scope", status: 403 };

  const { userIds } = userResult;
  const range = { userIds, from: period.utcFrom, to: period.utcTo };

  const [mwo, oml, mcp, ahpm, tc, ot, byUser] = await Promise.all([
    mattersWorkedOn(range),
    openMatterLoad({ userIds }),
    mattersClosedInPeriod(range),
    avgHoursPerMatter(range),
    tasksCompleted(range),
    overdueTasks({ userIds }),
    billableHoursByUser(range),
  ]);

  return {
    period: { from: period.from, to: period.to, label: period.label, labelAr: period.labelAr },
    scope,
    userCount: userIds.length,
    metrics: {
      mattersWorkedOn: mwo,
      openMatterLoad: oml,
      mattersClosed: mcp,
      avgHoursPerMatter: ahpm,
      tasksCompleted: tc,
      overdueTasks: ot,
    },
    breakdown: byUser,
  };
}
