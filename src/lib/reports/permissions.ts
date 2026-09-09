import { prisma } from "@/lib/prisma";
import type { ReportScope, ReportUser } from "./types";

export { buildPermissionSnapshot } from "../permissions.server";

export async function resolveReportScope(
  currentUser: ReportUser,
  requestedScope: ReportScope,
  requestedDepartmentId?: string
): Promise<{ allowed: boolean; userIds: string[]; reason?: string }> {
  if (requestedScope === "OWN") {
    if (!currentUser.permissions.granted.has("viewOwnReports")) {
      return { allowed: false, userIds: [], reason: "No viewOwnReports permission" };
    }
    return { allowed: true, userIds: [currentUser.id] };
  }

  if (requestedScope === "DEPARTMENT") {
    if (!currentUser.permissions.granted.has("viewDepartmentReports")) {
      return { allowed: false, userIds: [], reason: "No viewDepartmentReports permission" };
    }
    let targetDeptId = currentUser.departmentId;
    if (requestedDepartmentId && currentUser.permissions.granted.has("viewAllReports")) {
      targetDeptId = requestedDepartmentId;
    } else if (requestedDepartmentId && requestedDepartmentId !== currentUser.departmentId) {
      return { allowed: false, userIds: [], reason: "Cannot view other departments" };
    }
    if (!targetDeptId) return { allowed: false, userIds: [], reason: "No department assigned" };
    const users = await prisma.user.findMany({
      where: { departmentId: targetDeptId, deletedAt: null },
      select: { id: true },
    });
    return { allowed: true, userIds: users.map((u) => u.id) };
  }

  if (requestedScope === "ALL") {
    if (!currentUser.permissions.granted.has("viewAllReports")) {
      return { allowed: false, userIds: [], reason: "No viewAllReports permission" };
    }
    const users = await prisma.user.findMany({
      where: { deletedAt: null },
      select: { id: true },
    });
    return { allowed: true, userIds: users.map((u) => u.id) };
  }

  return { allowed: false, userIds: [], reason: "Invalid scope" };
}

/**
 * CRITICAL: Guards against scope-bypass on ?userId= query parameters.
 * Returns { allowed: false } if requestedUserId is outside the resolved scope.
 */
export function enforceUserIdInScope(
  resolvedUserIds: string[],
  requestedUserId: string | undefined
): { allowed: boolean; userIds: string[] } {
  if (!requestedUserId) return { allowed: true, userIds: resolvedUserIds };
  if (!resolvedUserIds.includes(requestedUserId)) return { allowed: false, userIds: [] };
  return { allowed: true, userIds: [requestedUserId] };
}
