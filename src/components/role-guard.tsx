"use client";

import * as React from "react";
import { useAuth } from "@/contexts/auth-provider";
import type { Role } from "@/lib/permissions";
import { hasPermission, type Permission } from "@/lib/permissions";

export function RoleGuard({
  roles,
  children,
}: {
  roles: Role[];
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role as Role)) return null;
  return <>{children}</>;
}

export function PermissionGuard({
  permission,
  children,
}: {
  permission: Permission;
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  if (!user || !hasPermission(user.role, permission)) return null;
  return <>{children}</>;
}
