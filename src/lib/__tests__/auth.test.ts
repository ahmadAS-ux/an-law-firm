import { beforeEach, expect, it, vi } from "vitest";
import { signSession } from "../session-token";
vi.mock("next/headers", () => ({ cookies: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: { user: { findUnique: vi.fn() } } }));
const { cookies } = await import("next/headers");
const { prisma } = await import("@/lib/prisma");
const { getCurrentUser } = await import("../auth");
beforeEach(async () => {
  vi.clearAllMocks();
  vi.stubEnv("NEXTAUTH_SECRET", "unit-test-signing-secret-32-bytes-long");
  const token = await signSession("u", process.env.NEXTAUTH_SECRET);
  vi.mocked(cookies).mockReturnValue({ get: () => ({ value: token }) } as never);
});
it.each([{ isActive: false, deletedAt: null }, { isActive: true, deletedAt: new Date() }])("rejects disabled/deleted user", async (user) => {
  vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "u", ...user } as never);
  expect(await getCurrentUser()).toBeNull();
});
it("returns active user for verified identity", async () => { vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "u", isActive: true, deletedAt: null } as never); expect((await getCurrentUser())?.id).toBe("u"); });
