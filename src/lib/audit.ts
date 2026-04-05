import { prisma } from "@/lib/prisma";

export async function createAuditLog(
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
  details?: unknown,
  ipAddress?: string | null,
) {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      entityType,
      entityId,
      details: details !== undefined ? JSON.stringify(details) : null,
      ipAddress: ipAddress ?? null,
    },
  });
}
