

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
  | "manageFiles"
  | "editApprovedMatter"
  | "deleteMatter";

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
    editApprovedMatter: true,
    deleteMatter: true,
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
    editApprovedMatter: true,
    deleteMatter: true,
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
    editApprovedMatter: false,
    deleteMatter: false,
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
    editApprovedMatter: false,
    deleteMatter: false,
  },
};

// ── DB-driven permission check (v0.5.0+) ─────────────────────────────────────

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
