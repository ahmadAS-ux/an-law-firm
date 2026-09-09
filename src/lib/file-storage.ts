import path from "node:path";
import { realpath } from "node:fs/promises";
import { randomBytes } from "node:crypto";
export function storageRoot() { return path.resolve(process.env.UPLOAD_DIR || path.join(process.cwd(), ".uploads")); }
export function resolveStorageKey(key: string, root = storageRoot()) {
  if (!key || path.isAbsolute(key) || key.includes("..") || key.includes("\\") || key.startsWith("/") || key.includes(":")) throw new Error("Invalid storage key");
  const resolved = path.resolve(root, key);
  const relative = path.relative(path.resolve(root), resolved);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) throw new Error("Storage path outside root");
  return resolved;
}
export function newStorageKey(extension: string) {
  if (!/^[a-z0-9]{1,8}$/.test(extension)) throw new Error("Invalid extension");
  const now = new Date();
  return `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/c${randomBytes(12).toString("hex")}.${extension}`;
}
export function legacyStoragePath(url: string) {
  if (!url.startsWith("/uploads/")) throw new Error("Invalid legacy URL");
  return resolveStorageKey(url.slice("/uploads/".length), path.join(process.cwd(), "public", "uploads"));
}
export async function readableFilePath(file: { storageKey: string | null; url: string | null }) {
  const root = file.storageKey ? storageRoot() : path.resolve("public/uploads");
  const candidate = file.storageKey ? resolveStorageKey(file.storageKey) : file.url ? legacyStoragePath(file.url) : null;
  if (!candidate) throw new Error("Missing file storage key");
  const [actual, actualRoot] = await Promise.all([realpath(candidate), realpath(root)]);
  const relative = path.relative(actualRoot, actual);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) throw new Error("File escaped storage root");
  return actual;
}
