import { prisma } from "@/lib/prisma";

export async function createAuditLog(
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
  details?: unknown,
  ipAddressOrCategory?: string | null,
  category?: string | null,
) {
  // Support both old callers (6 args, ipAddress) and new callers (7 args with category)
  const ipAddress = typeof ipAddressOrCategory === "string" && !["AUTH","MATTER","BILLING","PERMISSION","SYSTEM"].includes(ipAddressOrCategory)
    ? ipAddressOrCategory
    : null;
  const resolvedCategory = ["AUTH","MATTER","BILLING","PERMISSION","SYSTEM"].includes(ipAddressOrCategory ?? "")
    ? (ipAddressOrCategory as string)
    : (category ?? null);

  await prisma.auditLog.create({
    data: {
      userId,
      action,
      entityType,
      entityId,
      details: details !== undefined ? JSON.stringify(details) : null,
      ipAddress,
      category: resolvedCategory,
    },
  });
}
