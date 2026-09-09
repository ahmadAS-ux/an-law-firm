import { reportGuard, parseReportParams } from "@/lib/reports/route-guard";
import { getUtilizationReport } from "@/lib/reports";
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

  const result = await getUtilizationReport(
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

  const headers =
    lang === "ar"
      ? ["المستخدم", "الساعات القابلة للفوترة", "إجمالي الساعات"]
      : ["User ID", "Billable Hours", "Total Hours"];

  const bh = result.metrics.billableHours.value ?? 0;
  const nbh = result.metrics.nonBillableHours.value ?? 0;

  const summaryRows: string[][] = [
    headers,
    ["— Summary —", bh.toFixed(1), (bh + nbh).toFixed(1)],
    [],
    lang === "ar"
      ? ["المقياس", "القيمة"]
      : ["Metric", "Value"],
    [lang === "ar" ? "الساعات القابلة للفوترة" : "Billable Hours", bh.toFixed(1)],
    [lang === "ar" ? "الساعات غير القابلة للفوترة" : "Non-Billable Hours", nbh.toFixed(1)],
    [lang === "ar" ? "نسبة الفوترة" : "Billable Ratio", result.metrics.billableRatio.formatted],
    [lang === "ar" ? "معدل الاستخدام" : "Utilization Rate", result.metrics.utilizationRate.formatted],
    [lang === "ar" ? "إدخالات الوقت الفائتة" : "Missing Time Entries", String(result.metrics.missingEntries.value ?? 0)],
    [lang === "ar" ? "الإدخالات المتأخرة" : "Late Entries", String(result.metrics.lateEntries.value ?? 0)],
    [],
    lang === "ar" ? ["معرف المستخدم", "الساعات القابلة للفوترة"] : ["User ID", "Billable Hours"],
    ...result.breakdown.map((b) => [b.userId, b.hours.toFixed(1)]),
  ];

  const csv = buildCsv(summaryRows);
  const filename = `report-utilization-${result.period.from}-to-${result.period.to}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
