export type Role = "PARTNER" | "ADMIN" | "MANAGER" | "EMPLOYEE";

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
    manageUsers: false,
    viewBilling: true,
    systemSettings: false,
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
    createClientCase: true,
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

