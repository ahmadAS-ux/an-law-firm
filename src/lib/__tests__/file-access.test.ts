import { describe, expect, it } from "vitest";
import { canReadFile, canDeleteFile } from "../file-access";
import { resolveStorageKey, legacyStoragePath } from "../file-storage";
describe("private files", () => {
  const employee = { id: "u1", role: "EMPLOYEE" };
  const file = { deletedAt: null, caseId: "c1", case: { assignedToId: "u1" } };
  it("separates assigned read from delete", () => { expect(canReadFile(employee, file)).toBe(true); expect(canDeleteFile(employee, file)).toBe(false); });
  it("hides unassigned and parentless files", () => { expect(canReadFile({ ...employee, id: "u2" }, file)).toBe(false); expect(canReadFile(employee, { ...file, caseId: null })).toBe(false); });
  it("hides soft deleted files", () => { expect(canReadFile({ id: "p", role: "PARTNER" }, { ...file, deletedAt: new Date() })).toBe(false); });
  it.each(["../x", "/etc/passwd", "C:\\x", "a/../../x", "a\\x"])("rejects unsafe storage path %s", (key) => { expect(() => resolveStorageKey(key)).toThrow(); });
  it("rejects legacy traversal", () => { expect(() => legacyStoragePath("/uploads/../.env")).toThrow(); });
});
