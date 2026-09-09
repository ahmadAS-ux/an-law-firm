import type { PrismaClient } from "@prisma/client";
import { PERMISSIONS, ROLE_MATRIX, ROLES_DEF } from "./policy";

export async function seedReference(db: PrismaClient) {
  for (const d of [{ name: "Litigation", nameAr: "التقاضي" }, { name: "Corporate", nameAr: "الشركات" }]) {
    await db.department.upsert({ where: { name: d.name }, create: d, update: {} });
  }
  const roles: Record<string, string> = {};
  for (const role of ROLES_DEF) {
    const row = await db.role.upsert({ where: { name: role.name }, create: role,
      update: { nameAr: role.nameAr, isLocked: role.isLocked } });
    roles[role.name] = row.id;
  }
  for (const definition of PERMISSIONS) {
    const permission = await db.permission.upsert({ where: { key: definition.key }, create: definition,
      update: { category: definition.category, description: definition.description, descriptionAr: definition.descriptionAr } });
    for (const role of ROLES_DEF) {
      const grant = ROLE_MATRIX[role.name][definition.key] ?? { granted: false };
      const policy = { granted: grant.granted, scope: grant.scope ?? "ALL", isLocked: grant.isLocked ?? false, lockedDirection: grant.lockedDirection ?? null };
      await db.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: roles[role.name], permissionId: permission.id } },
        create: { roleId: roles[role.name], permissionId: permission.id, ...policy },
        update: grant.isLocked && ["PARTNER", "SYSTEM_ADMIN"].includes(role.name) ? policy : {},
      });
    }
  }
  await db.reportConfig.upsert({ where: { id: "default" }, create: { id: "default" }, update: {} });
  for (const [legacy, current] of Object.entries({ PARTNER: "PARTNER", ADMIN: "SYSTEM_ADMIN", MANAGER: "DEPARTMENT_MANAGER", EMPLOYEE: "EMPLOYEE" })) {
    await db.user.updateMany({ where: { role: legacy, roleId: null }, data: { roleId: roles[current] } });
  }
  return roles;
}
