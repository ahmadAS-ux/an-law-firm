import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PrismaClient } from "@prisma/client";
import { seedReference } from "../reference";
import { seedDemo } from "../demo";
import { resetPolicy } from "../reset-policy";

type Data = Record<string, unknown>;
function fakeClient() {
  const grants = new Map<string, Data>();
  const users = [{ id: "existing", role: "EMPLOYEE", roleId: "custom-role", departmentId: "custom-dept" }];
  const metadata = () => ({ upsert: vi.fn(async ({ create }: { create: Data }) => ({ ...create, id: create.name ?? create.key ?? create.id })) });
  const client = {
    department: metadata(), role: metadata(), permission: metadata(), reportConfig: metadata(),
    user: { updateMany: vi.fn(async ({ where, data }: { where: Data; data: Data }) => {
      for (const user of users) if (user.role === where.role && user.roleId === where.roleId) Object.assign(user, data);
      return { count: 0 };
    }) },
    rolePermission: { upsert: vi.fn(async ({ create, update }: { create: Data; update: Data }) => {
      const key = `${create.roleId}:${create.permissionId}`;
      const row = grants.get(key);
      if (row) Object.assign(row, update); else grants.set(key, { ...create });
      return grants.get(key);
    }) },
  };
  return { db: client as unknown as PrismaClient, grants, users };
}
describe("reference seed preserves choices", () => {
  it("preserves editable grant and scope across two reruns", async () => {
    const { db, grants } = fakeClient();
    await seedReference(db);
    const row = grants.get("EMPLOYEE:createMatter")!;
    row.granted = false; row.scope = "OWN";
    await seedReference(db); await seedReference(db);
    expect(row.granted).toBe(false); expect(row.scope).toBe("OWN");
  });
  it("reasserts all locked policy fields", async () => {
    const { db, grants } = fakeClient(); await seedReference(db);
    const row = grants.get("PARTNER:createMatter")!;
    Object.assign(row, { granted: false, scope: "OWN", isLocked: false, lockedDirection: "OFF" });
    await seedReference(db);
    expect(row).toMatchObject({ granted: true, scope: "ALL", isLocked: true, lockedDirection: "ON" });
  });
  it("preserves existing user role and department", async () => {
    const { db, users } = fakeClient(); await seedReference(db); await seedReference(db);
    expect(users[0]).toMatchObject({ roleId: "custom-role", departmentId: "custom-dept" });
  });
});
describe("explicit seed guards", () => {
  beforeEach(() => { vi.stubEnv("ALLOW_DEMO_SEED", ""); vi.stubEnv("CONFIRM_POLICY_RESET", ""); });
  it("refuses demo without opt-in before touching the database", async () => { await expect(seedDemo({} as PrismaClient)).rejects.toThrow("disabled"); });
  it("refuses a non-disposable database", async () => {
    vi.stubEnv("ALLOW_DEMO_SEED", "true");
    const tx = { systemFlag: { findUnique: async () => null }, workLog: { findMany: async () => [{ id: "real" }] } };
    const db = { $transaction: (fn: (tx: unknown) => Promise<unknown>) => fn(tx) } as unknown as PrismaClient;
    await expect(seedDemo(db)).rejects.toThrow("Non-disposable");
  });
  it("refuses reset without actor", async () => { vi.stubEnv("CONFIRM_POLICY_RESET", "yes"); await expect(resetPolicy({} as PrismaClient, "")).rejects.toThrow("actor"); });
});
