import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/auth", () => ({
  getCurrentUser: vi.fn(),
}));

const { getCurrentUser } = await import("@/lib/auth");
const { checkApiPermission, requireUser } = await import("@/lib/api-permissions");

function makeRequest(url = "http://localhost/api/test") {
  return new NextRequest(url);
}

describe("checkApiPermission", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when no user", async () => {
    vi.mocked(getCurrentUser).mockResolvedValueOnce(null);
    const result = await checkApiPermission(makeRequest(), "viewAllClients");
    expect(result).toBeInstanceOf(Response);
    expect((result as Response).status).toBe(401);
  });

  it("returns 401 when user is inactive", async () => {
    vi.mocked(getCurrentUser).mockResolvedValueOnce({
      id: "u1",
      role: "PARTNER",
      isActive: false,
    } as never);
    const result = await checkApiPermission(makeRequest(), "viewAllClients");
    expect(result).toBeInstanceOf(Response);
    expect((result as Response).status).toBe(401);
  });

  it("returns 403 when permission denied (EMPLOYEE requesting viewHRReports)", async () => {
    vi.mocked(getCurrentUser).mockResolvedValueOnce({
      id: "u1",
      role: "EMPLOYEE",
      isActive: true,
    } as never);
    const result = await checkApiPermission(makeRequest(), "viewHRReports");
    expect(result).toBeInstanceOf(Response);
    expect((result as Response).status).toBe(403);
  });

  it("returns user object when permission granted (PARTNER viewAllClients)", async () => {
    const user = { id: "u1", role: "PARTNER", isActive: true };
    vi.mocked(getCurrentUser).mockResolvedValueOnce(user as never);
    const result = await checkApiPermission(makeRequest(), "viewAllClients");
    expect(result).not.toBeInstanceOf(Response);
    expect((result as typeof user).role).toBe("PARTNER");
  });
});

describe("requireUser", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when no user", async () => {
    vi.mocked(getCurrentUser).mockResolvedValueOnce(null);
    const result = await requireUser();
    expect(result).toBeInstanceOf(Response);
    expect((result as Response).status).toBe(401);
  });

  it("returns user when authenticated and active", async () => {
    const user = { id: "u2", role: "MANAGER", isActive: true };
    vi.mocked(getCurrentUser).mockResolvedValueOnce(user as never);
    const result = await requireUser();
    expect(result).not.toBeInstanceOf(Response);
    expect((result as typeof user).id).toBe("u2");
  });
});
