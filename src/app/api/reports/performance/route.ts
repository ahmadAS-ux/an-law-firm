import { NextResponse } from "next/server";
import { getPerformanceReport } from "@/lib/reports";
import { reportGuard, parseReportParams } from "@/lib/reports/route-guard";
import type { ReportPeriodPreset } from "@/lib/reports";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const { scope, period, customFrom, customTo, userId, departmentId } = parseReportParams(url);

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
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json(result);
}
