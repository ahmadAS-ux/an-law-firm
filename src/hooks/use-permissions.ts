"use client";

import { useAuth } from "@/contexts/auth-provider";
import { getPermissions, type Permission } from "@/lib/permissions";

export function usePermissions(): Record<Permission, boolean> {
  const { user } = useAuth();
  const role = user?.role ?? "EMPLOYEE";
  return getPermissions(role);
}
