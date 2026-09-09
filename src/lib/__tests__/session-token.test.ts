import { describe, it, expect } from "vitest";
import { signSession, verifySession, SESSION_SECONDS, secretMatches } from "../session-token";
const secret = "test-secret-at-least-32-bytes-long";
describe("signed sessions", () => {
  it("verifies signed identity", async () => { expect(await verifySession(await signSession("u1", secret, 100), secret, 101)).toBe("u1"); });
  it("rejects changed payload", async () => { const token = await signSession("u1", secret, 100); expect(await verifySession("e30." + token.split(".")[1], secret, 101)).toBeNull(); });
  it("rejects changed signature", async () => { const token = await signSession("u1", secret, 100); expect(await verifySession(token.split(".")[0] + "." + "A".repeat(43), secret, 101)).toBeNull(); });
  it("rejects expiry on the server", async () => { expect(await verifySession(await signSession("u1", secret, 100), secret, 100 + SESSION_SECONDS)).toBeNull(); });
  it.each([undefined, "u1", "bad.bad", "a.b.c", "!.$"])("rejects malformed %s", async (token) => { expect(await verifySession(token, secret)).toBeNull(); });
  it("fails closed without a sufficient secret", async () => { expect(await verifySession(await signSession("u1", secret), undefined)).toBeNull(); await expect(signSession("u1", "short")).rejects.toThrow(); });
  it("rejects wrong dev secret", async () => { expect(await secretMatches("wrong", secret)).toBe(false); expect(await secretMatches("", undefined)).toBe(false); expect(await secretMatches(secret, secret)).toBe(true); });
});
