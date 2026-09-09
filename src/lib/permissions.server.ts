import "server-only";
import { prisma } from "@/lib/prisma";
import type { PermissionSnapshot } from "./reports/types";
const missingKeys = new Set<string>();
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

  const permissionId = await getPermissionId(permissionKey);
  if (!permissionId) return false;
  const rp = await prisma.rolePermission.findUnique({
    where: { roleId_permissionId: { roleId: user.roleId, permissionId } },
  });
  if (!rp || !rp.granted) return false;

  if (rp.scope === "ALL") return true;
  if (rp.scope === "OWN_DEPARTMENT") {
    if (!context?.departmentId) return false;
    return user.departmentId === context.departmentId;
  }
  if (rp.scope === "OWN") {
    if (!context?.ownerId) return false;
    return context.ownerId === userId;
  }
  if (rp.scope === "PARTIAL") return rp.granted;
  return false;
}

export async function getPermissionId(key: string): Promise<string> {
  const p = await prisma.permission.findUnique({ where: { key }, select: { id: true } });
  if (!p && !missingKeys.has(key)) { missingKeys.add(key); console.warn("Unknown permission key:", key); } return p?.id ?? "";
}

export async function getRolePermissions(roleId: string) {
  return prisma.rolePermission.findMany({
    where: { roleId },
    include: { permission: true },
    orderBy: [{ permission: { category: "asc" } }, { permission: { key: "asc" } }],
  });
}

export async function buildPermissionSnapshot(userId: string): Promise<PermissionSnapshot> {
  const rolePerms = await prisma.rolePermission.findMany({
    where: { role: { users: { some: { id: userId } } }, granted: true },
    include: { permission: true },
  });
  const granted = new Set<string>(rolePerms.map((rp) => rp.permission.key));
  const scopes = new Map<string, string>(rolePerms.map((rp) => [rp.permission.key, rp.scope]));
  return { granted, scopes };
}
