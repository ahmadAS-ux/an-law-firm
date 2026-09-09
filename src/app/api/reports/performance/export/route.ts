import { reportGuard, parseReportParams } from "@/lib/reports/route-guard";
import { getPerformanceReport } from "@/lib/reports";
import type { ReportPeriodPreset } from "@/lib/reports";

export const dynamic = "force-dynamic";

function buildCsv(rows: string[][]): string {
  const BOM = "﻿";
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\r\n");
  return BOM + csv;
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const { scope, period, customFrom, customTo, userId, departmentId } = parseReportParams(url);
  const lang = (url.searchParams.get("lang") ?? "ar") as "en" | "ar";

  const guard = await reportGuard(request, scope, userId, departmentId);
  if (!guard.ok) return guard.response;

  const result = await getPerformanceReport(
    guard.dbUser,
    scope,
    period as ReportPeriodPreset,
    { userId, departmentId },
    customFrom,
    customTo
  );

  if ("error" in result) {
    return new Response(JSON.stringify({ error: result.error }), { status: result.status });
  }

  const m = result.metrics;
  const rows: string[][] = [
    lang === "ar"
      ? ["المقياس", "القيمة"]
      : ["Metric", "Value"],
    [lang === "ar" ? "المسائل المعمول عليها" : "Matters Worked On",        String(m.mattersWorkedOn.value ?? 0)],
    [lang === "ar" ? "المسائل المفتوحة"       : "Open Matter Load",         String(m.openMatterLoad.value ?? 0)],
    [lang === "ar" ? "المسائل المغلقة"        : "Matters Closed",           String(m.mattersClosed.value ?? 0)],
    [lang === "ar" ? "متوسط ساعات/مسألة"     : "Avg Hours per Matter",     m.avgHoursPerMatter.formatted],
    [lang === "ar" ? "المهام المكتملة"        : "Tasks Completed",          String(m.tasksCompleted.value ?? 0)],
    [lang === "ar" ? "المهام المتأخرة"        : "Overdue Tasks",            String(m.overdueTasks.value ?? 0)],
    [],
    lang === "ar"
      ? ["معرف المستخدم", "الساعات القابلة للفوترة"]
      : ["User ID", "Billable Hours"],
    ...result.breakdown.map((b) => [b.userId, b.hours.toFixed(1)]),
  ];

  const csv = buildCsv(rows);
  const filename = `report-performance-${result.period.from}-to-${result.period.to}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
