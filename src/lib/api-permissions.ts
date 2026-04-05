import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission, type Permission } from "@/lib/permissions";

export async function checkApiPermission(
  _request: NextRequest,
  permission: Permission,
) {
  const user = await getCurrentUser();
  if (!user || !user.isActive) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (!hasPermission(user.role, permission)) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }
  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user || !user.isActive) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return user;
}
