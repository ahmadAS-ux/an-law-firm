/**
 * Shared guard logic for all report API routes.
 * Handles auth, scope resolution, and ?userId= bypass enforcement.
 */
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  buildPermissionSnapshot,
  resolveReportScope,
  enforceUserIdInScope,
} from "./permissions";
import type { ReportScope, ReportUser } from "./types";

export interface GuardSuccess {
  ok: true;
  dbUser: { id: string; departmentId: string | null };
  reportUser: ReportUser;
  userIds: string[];
  scope: ReportScope;
}

export interface GuardFailure {
  ok: false;
  response: Response;
}

export type GuardResult = GuardSuccess | GuardFailure;

function json(body: object, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function reportGuard(
  request: Request,
  requestedScope: ReportScope,
  requestedUserId: string | undefined,
  requestedDepartmentId: string | undefined
): Promise<GuardResult> {
  const user = await getCurrentUser();
  if (!user || !user.isActive) {
    return { ok: false, response: json({ error: "Unauthorized" }, 401) };
  }

  const permissions = await buildPermissionSnapshot(user.id);
  const reportUser: ReportUser = {
    id: user.id,
    departmentId: user.departmentId,
    roleName: user.role,
    permissions,
  };

  const scopeResult = await resolveReportScope(reportUser, requestedScope, requestedDepartmentId);
  if (!scopeResult.allowed) {
    return { ok: false, response: json({ error: scopeResult.reason ?? "Forbidden" }, 403) };
  }

  const userResult = enforceUserIdInScope(scopeResult.userIds, requestedUserId);
  if (!userResult.allowed) {
    // Audit log the attempted scope bypass
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "REPORT_SCOPE_BYPASS_ATTEMPT",
        entityType: "Report",
        entityId: requestedUserId ?? "unknown",
        category: "AUTH",
        details: JSON.stringify({
          requestedUserId,
          allowedUserIds: scopeResult.userIds,
          scope: requestedScope,
        }),
      },
    });
    return { ok: false, response: json({ error: "Forbidden — user out of scope" }, 403) };
  }

  return {
    ok: true,
    dbUser: { id: user.id, departmentId: user.departmentId },
    reportUser,
    userIds: userResult.userIds,
    scope: requestedScope,
  };
}

/** Parses and validates common report query parameters. */
export function parseReportParams(url: URL): {
  scope: ReportScope;
  period: string;
  customFrom: string | undefined;
  customTo: string | undefined;
  userId: string | undefined;
  departmentId: string | undefined;
} {
  const scope = (url.searchParams.get("scope") ?? "OWN") as ReportScope;
  const period = url.searchParams.get("period") ?? "thisMonth";
  const customFrom = url.searchParams.get("from") ?? undefined;
  const customTo = url.searchParams.get("to") ?? undefined;
  const userId = url.searchParams.get("userId") ?? undefined;
  const departmentId = url.searchParams.get("departmentId") ?? undefined;
  return { scope, period, customFrom, customTo, userId, departmentId };
}
