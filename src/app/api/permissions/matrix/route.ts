import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-permissions";
import { hasPermissionDb } from "@/lib/permissions.server";
import { createAuditLog } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET() {
  const userOrErr = await requireUser();
  if (userOrErr instanceof Response) return userOrErr;

  const [roles, permissions, rolePermissions] = await Promise.all([
    prisma.role.findMany({ orderBy: { name: "asc" } }),
    prisma.permission.findMany({ orderBy: [{ category: "asc" }, { key: "asc" }] }),
    prisma.rolePermission.findMany(),
  ]);

  return NextResponse.json({ roles, permissions, rolePermissions });
}

export async function PATCH(request: NextRequest) {
  const userOrErr = await requireUser();
  if (userOrErr instanceof Response) return userOrErr;
  const user = userOrErr;

  const canEdit = await hasPermissionDb(user.id, "editPermissions");
  if (!canEdit) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json() as Array<{ roleId: string; permissionId: string; granted: boolean; scope: string }>;

  // Reject any attempt to modify locked permissions
  const ids = body.map((u) => ({ roleId: u.roleId, permissionId: u.permissionId }));
  const locked = await prisma.rolePermission.findMany({
    where: { OR: ids.map((x) => ({ roleId: x.roleId, permissionId: x.permissionId })) },
    select: { roleId: true, permissionId: true, isLocked: true },
  });
  const lockedSet = new Set(locked.filter((l) => l.isLocked).map((l) => `${l.roleId}:${l.permissionId}`));

  const rejected = body.filter((u) => lockedSet.has(`${u.roleId}:${u.permissionId}`));
  if (rejected.length > 0) {
    await createAuditLog(user.id, "PERMISSION_LOCK_VIOLATION", "RolePermission", "matrix", { rejected }, null, "PERMISSION");
    return NextResponse.json({ error: "Cannot modify locked permissions" }, { status: 409 });
  }

  // Capture before state for audit
  const before = await prisma.rolePermission.findMany({
    where: { OR: ids.map((x) => ({ roleId: x.roleId, permissionId: x.permissionId })) },
  });

  await prisma.$transaction(
    body.map((u) =>
      prisma.rolePermission.updateMany({
        where: { roleId: u.roleId, permissionId: u.permissionId, isLocked: false },
        data: { granted: u.granted, scope: u.scope },
      })
    )
  );

  await createAuditLog(user.id, "UPDATE", "RolePermission", "matrix", {
    before: before.map((b) => ({ roleId: b.roleId, permissionId: b.permissionId, granted: b.granted })),
    after: body,
  }, null, "PERMISSION");

  return NextResponse.json({ ok: true });
}
