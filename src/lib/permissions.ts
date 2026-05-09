import { prisma } from "@/lib/prisma";

export type Role = "PARTNER" | "ADMIN" | "MANAGER" | "EMPLOYEE";
// v0.5.0 DB-backed roles — TODO: replace legacy Role type in v0.6.0
export type DbRoleName = "PARTNER" | "SYSTEM_ADMIN" | "DEPARTMENT_MANAGER" | "EMPLOYEE" | "ADMIN_STAFF" | "ACCOUNTANT";

export type Permission =
  | "viewAllClients"
  | "createClientCase"
  | "assignToAnyone"
  | "assignToTeam"
  | "assignToSelf"
  | "approveWorkLogs"
  | "viewHRReports"
  | "manageUsers"
  | "viewBilling"
  | "systemSettings"
  | "viewAuditLog"
  | "manageFiles";

const matrix: Record<Role, Record<Permission, boolean>> = {
  PARTNER: {
    viewAllClients: true,
    createClientCase: true,
    assignToAnyone: true,
    assignToTeam: true,
    assignToSelf: true,
    approveWorkLogs: true,
    viewHRReports: true,
    manageUsers: true,
    viewBilling: true,
    systemSettings: true,
    viewAuditLog: true,
    manageFiles: true,
  },
  ADMIN: {
    viewAllClients: true,
    createClientCase: true,
    assignToAnyone: true,
    assignToTeam: true,
    assignToSelf: true,
    approveWorkLogs: true,
    viewHRReports: true,
    manageUsers: true,
    viewBilling: true,
    systemSettings: true,
    viewAuditLog: true,
    manageFiles: true,
  },
  MANAGER: {
    viewAllClients: true,
    createClientCase: true,
    assignToAnyone: false,
    assignToTeam: true,
    assignToSelf: true,
    approveWorkLogs: true,
    viewHRReports: true,
    manageUsers: false,
    viewBilling: false,
    systemSettings: false,
    viewAuditLog: false,
    manageFiles: true,
  },
  EMPLOYEE: {
    viewAllClients: false,
    createClientCase: false,
    assignToAnyone: false,
    assignToTeam: false,
    assignToSelf: true,
    approveWorkLogs: false,
    viewHRReports: false,
    manageUsers: false,
    viewBilling: false,
    systemSettings: false,
    viewAuditLog: false,
    manageFiles: false,
  },
};

// ── DB-driven permission check (v0.5.0+) ─────────────────────────────────────

export interface PermissionContext {
  departmentId?: string;
  ownerId?: string;
}

export async function hasPermissionDb(
  userId: string,
  permissionKey: string,
  context?: PermissionContext,
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { roleId: true, departmentId: true },
  });
  if (!user?.roleId) return false;

  const rp = await prisma.rolePermission.findUnique({
    where: { roleId_permissionId: { roleId: user.roleId, permissionId: await getPermissionId(permissionKey) } },
  });
  if (!rp || !rp.granted) return false;

  if (rp.scope === "ALL") return true;
  if (rp.scope === "OWN_DEPARTMENT") {
    if (!context?.departmentId) return true; // no context provided — allow
    return user.departmentId === context.departmentId;
  }
  if (rp.scope === "OWN") {
    if (!context?.ownerId) return true;
    return context.ownerId === userId;
  }
  if (rp.scope === "PARTIAL") return rp.granted;
  return false;
}

async function getPermissionId(key: string): Promise<string> {
  const p = await prisma.permission.findUnique({ where: { key }, select: { id: true } });
  return p?.id ?? "";
}

export async function getRolePermissions(roleId: string) {
  return prisma.rolePermission.findMany({
    where: { roleId },
    include: { permission: true },
    orderBy: [{ permission: { category: "asc" } }, { permission: { key: "asc" } }],
  });
}

// ── Legacy sync check (kept for existing callers) ─────────────────────────────

export function hasPermission(role: string, permission: Permission): boolean {
  const r = role as Role;
  if (!matrix[r]) return false;
  return matrix[r][permission] ?? false;
}

export function getPermissions(role: string): Record<Permission, boolean> {
  const r = role as Role;
  const row = matrix[r];
  if (!row) {
    return Object.fromEntries(
      Object.keys(matrix.PARTNER).map((k) => [k, false]),
    ) as Record<Permission, boolean>;
  }
  return { ...row };
}

