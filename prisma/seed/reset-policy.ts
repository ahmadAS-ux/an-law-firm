import type { PrismaClient } from "@prisma/client";
import { PERMISSIONS, ROLE_MATRIX } from "./policy";

export async function resetPolicy(db: PrismaClient, actorId: string) {
  if (process.env.CONFIRM_POLICY_RESET !== "yes" || !actorId || process.env.POLICY_RESET_ACTOR !== actorId) throw new Error("Policy reset requires confirmation and actor");
  return db.$transaction(async (tx) => {
    const actor = await tx.user.findUnique({ where: { id: actorId }, include: { dbRole: true } });
    if (!actor?.isActive || actor.deletedAt || !["PARTNER", "SYSTEM_ADMIN"].includes(actor.dbRole?.name ?? "")) throw new Error("Invalid policy reset actor");
    const before = await tx.rolePermission.findMany();
    const roles = await tx.role.findMany();
    const permissions = await tx.permission.findMany();
    for (const role of roles) for (const p of permissions) {
      if (!ROLE_MATRIX[role.name] || !PERMISSIONS.some((x) => x.key === p.key)) continue;
      const grant = ROLE_MATRIX[role.name][p.key] ?? { granted: false };
      const policy = { granted: grant.granted, scope: grant.scope ?? "ALL", isLocked: grant.isLocked ?? false, lockedDirection: grant.lockedDirection ?? null };
      await tx.rolePermission.upsert({ where: { roleId_permissionId: { roleId: role.id, permissionId: p.id } },
        create: { roleId: role.id, permissionId: p.id, ...policy }, update: policy });
    }
    const after = await tx.rolePermission.findMany();
    await tx.auditLog.create({ data: { userId: actorId, action: "POLICY_RESET", entityType: "RolePermission", entityId: "matrix", category: "PERMISSION", details: JSON.stringify({ before, after }) } });
  });
}
