import { cookies } from "next/headers";
import type { Prisma } from "@prisma/client";
import type { ClientUserDTO } from "@/types/auth";
import { prisma } from "@/lib/prisma";

import { AUTH_COOKIE_NAME, verifySession } from "./session-token";
export { AUTH_COOKIE_NAME } from "./session-token";
export type SessionUser = Prisma.UserGetPayload<{ include: { dbRole: true } }>;

export async function getSessionUserId(): Promise<string | null> {
  const jar = await cookies();
  return verifySession(jar.get(AUTH_COOKIE_NAME)?.value, process.env.NEXTAUTH_SECRET);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const id = await getSessionUserId();
  if (!id) return null;
  const user = await prisma.user.findUnique({ where: { id }, include: { dbRole: true } });
  return user?.isActive && !user.deletedAt ? user : null;
}

export function toClientUser(user: SessionUser): ClientUserDTO {
  return { id: user.id, name: user.name, nameAr: user.nameAr, email: user.email, roleName: user.dbRole?.name ?? null,
    departmentId: user.departmentId, teamId: user.teamId, avatarUrl: user.avatarUrl, role: user.role };
}
