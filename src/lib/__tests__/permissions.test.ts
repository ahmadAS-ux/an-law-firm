import { describe, it, expect, vi, beforeEach } from "vitest";
import { hasPermission, getPermissions, hasPermissionDb } from "@/lib/permissions";

// ── hasPermission (legacy sync matrix) ──────────────────────────────────────

describe("hasPermission — legacy matrix", () => {
  it("PARTNER has all permissions", () => {
    expect(hasPermission("PARTNER", "viewAllClients")).toBe(true);
    expect(hasPermission("PARTNER", "systemSettings")).toBe(true);
    expect(hasPermission("PARTNER", "manageUsers")).toBe(true);
    expect(hasPermission("PARTNER", "editApprovedMatter")).toBe(true);
    expect(hasPermission("PARTNER", "deleteMatter")).toBe(true);
  });

  it("EMPLOYEE has minimal permissions", () => {
    expect(hasPermission("EMPLOYEE", "viewAllClients")).toBe(false);
    expect(hasPermission("EMPLOYEE", "createClientCase")).toBe(false);
    expect(hasPermission("EMPLOYEE", "manageUsers")).toBe(false);
    expect(hasPermission("EMPLOYEE", "editApprovedMatter")).toBe(false);
    expect(hasPermission("EMPLOYEE", "assignToSelf")).toBe(true);
  });

  it("MANAGER has team-level permissions but not admin", () => {
    expect(hasPermission("MANAGER", "createClientCase")).toBe(true);
    expect(hasPermission("MANAGER", "assignToTeam")).toBe(true);
    expect(hasPermission("MANAGER", "assignToAnyone")).toBe(false);
    expect(hasPermission("MANAGER", "systemSettings")).toBe(false);
    expect(hasPermission("MANAGER", "manageUsers")).toBe(false);
  });

  it("unknown role returns false for all permissions", () => {
    expect(hasPermission("UNKNOWN_ROLE", "viewAllClients")).toBe(false);
    expect(hasPermission("UNKNOWN_ROLE", "createClientCase")).toBe(false);
  });

  it("getPermissions returns complete record for PARTNER", () => {
    const perms = getPermissions("PARTNER");
    expect(perms.viewAllClients).toBe(true);
    expect(perms.systemSettings).toBe(true);
    expect(typeof perms).toBe("object");
  });

  it("getPermissions returns all-false record for unknown role", () => {
    const perms = getPermissions("GHOST");
    const values = Object.values(perms);
    expect(values.every((v) => v === false)).toBe(true);
  });
});

// ── hasPermissionDb (DB-driven, async) ───────────────────────────────────────

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    permission: {
      findUnique: vi.fn(),
    },
    rolePermission: {
      findUnique: vi.fn(),
    },
  },
}));

const { prisma } = await import("@/lib/prisma");

describe("hasPermissionDb — DB-driven", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns false when user has no roleId", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      roleId: null,
      departmentId: null,
    } as never);
    expect(await hasPermissionDb("user-1", "viewAllClients")).toBe(false);
  });

  it("returns false when permission not found in DB", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      roleId: "role-1",
      departmentId: "dept-1",
    } as never);
    vi.mocked(prisma.permission.findUnique).mockResolvedValueOnce(null);
    vi.mocked(prisma.rolePermission.findUnique).mockResolvedValueOnce(null);
    expect(await hasPermissionDb("user-1", "nonexistent")).toBe(false);
  });

  it("returns true when scope=ALL and granted=true", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      roleId: "role-1",
      departmentId: "dept-1",
    } as never);
    vi.mocked(prisma.permission.findUnique).mockResolvedValueOnce({ id: "perm-1" } as never);
    vi.mocked(prisma.rolePermission.findUnique).mockResolvedValueOnce({
      granted: true,
      scope: "ALL",
    } as never);
    expect(await hasPermissionDb("user-1", "viewAllClients")).toBe(true);
  });

  it("returns false when granted=false", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      roleId: "role-1",
      departmentId: "dept-1",
    } as never);
    vi.mocked(prisma.permission.findUnique).mockResolvedValueOnce({ id: "perm-1" } as never);
    vi.mocked(prisma.rolePermission.findUnique).mockResolvedValueOnce({
      granted: false,
      scope: "ALL",
    } as never);
    expect(await hasPermissionDb("user-1", "viewAllClients")).toBe(false);
  });

  it("OWN_DEPARTMENT scope: returns true when user is in same department", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      roleId: "role-1",
      departmentId: "dept-1",
    } as never);
    vi.mocked(prisma.permission.findUnique).mockResolvedValueOnce({ id: "perm-1" } as never);
    vi.mocked(prisma.rolePermission.findUnique).mockResolvedValueOnce({
      granted: true,
      scope: "OWN_DEPARTMENT",
    } as never);
    expect(
      await hasPermissionDb("user-1", "approveMatter", { departmentId: "dept-1" }),
    ).toBe(true);
  });

  it("OWN_DEPARTMENT scope: returns false when user is in different department", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      roleId: "role-1",
      departmentId: "dept-1",
    } as never);
    vi.mocked(prisma.permission.findUnique).mockResolvedValueOnce({ id: "perm-1" } as never);
    vi.mocked(prisma.rolePermission.findUnique).mockResolvedValueOnce({
      granted: true,
      scope: "OWN_DEPARTMENT",
    } as never);
    expect(
      await hasPermissionDb("user-1", "approveMatter", { departmentId: "dept-2" }),
    ).toBe(false);
  });

  it("OWN scope: returns true when ownerId matches userId", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      roleId: "role-1",
      departmentId: null,
    } as never);
    vi.mocked(prisma.permission.findUnique).mockResolvedValueOnce({ id: "perm-1" } as never);
    vi.mocked(prisma.rolePermission.findUnique).mockResolvedValueOnce({
      granted: true,
      scope: "OWN",
    } as never);
    expect(await hasPermissionDb("user-1", "editOwnWorkLog", { ownerId: "user-1" })).toBe(true);
  });

  it("OWN scope: returns false when ownerId differs from userId", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      roleId: "role-1",
      departmentId: null,
    } as never);
    vi.mocked(prisma.permission.findUnique).mockResolvedValueOnce({ id: "perm-1" } as never);
    vi.mocked(prisma.rolePermission.findUnique).mockResolvedValueOnce({
      granted: true,
      scope: "OWN",
    } as never);
    expect(await hasPermissionDb("user-1", "editOwnWorkLog", { ownerId: "user-2" })).toBe(false);
  });
});
