import { PrismaClient } from "@prisma/client";
import { createHash } from "node:crypto";
import { createReadStream, constants } from "node:fs";
import { appendFile, copyFile, mkdir, readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { legacyStoragePath, newStorageKey, readableFilePath, resolveStorageKey } from "../src/lib/file-storage";

const db = new PrismaClient();
const progress = path.resolve("scripts/migrate-uploads.progress.jsonl");
async function checksum(file: string) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(file)) hash.update(chunk);
  return hash.digest("hex");
}
async function sourcePath(url: string) {
  const candidate = await realpath(legacyStoragePath(url));
  const root = await realpath(path.resolve("public/uploads"));
  const relative = path.relative(root, candidate);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) throw new Error("Legacy source escaped root");
  return candidate;
}
async function main() {
  const mode = process.argv[2] ?? "--dry-run";
  if (!["--dry-run", "--apply", "--verify"].includes(mode)) throw new Error("Use --dry-run, --apply, or --verify");
  const known = new Map<string, { key: string; sha256: string }>();
  try {
    for (const line of (await readFile(progress, "utf8")).split(/\r?\n/).filter(Boolean)) {
      try { const record = JSON.parse(line); if (record.status === "done") known.set(record.fileId, record); } catch { /* incomplete trailing record is not authoritative */ }
    }
  } catch { /* no prior progress */ }
  const files = await db.file.findMany({ where: { url: { not: null } }, orderBy: { id: "asc" } });
  let failures = 0;
  for (const file of files) {
    try {
      let source: string | null = null;
      try { source = await sourcePath(file.url!); } catch { /* reported below */ }
      const expected = source ? await checksum(source) : known.get(file.id)?.key === file.storageKey ? known.get(file.id)?.sha256 : undefined;
      if (file.storageKey && expected) {
        try { if (await checksum(await readableFilePath(file)) === expected) { console.log(`${file.id}: verified`); continue; } } catch { /* recopy from source below */ }
      }
      if (!source) throw new Error("missing source or unverifiable destination");
      if (mode === "--verify") throw new Error("destination missing or checksum mismatch");
      if (mode === "--dry-run") { console.log(`${file.id}: source exists; ${file.storageKey ? "destination mismatch/collision" : "pending"}`); continue; }
      const extension = path.extname(source).slice(1).toLowerCase();
      const key = newStorageKey(/^[a-z0-9]{1,8}$/.test(extension) ? extension : "bin");
      const destination = resolveStorageKey(key);
      await mkdir(path.dirname(destination), { recursive: true });
      await copyFile(source, destination, constants.COPYFILE_EXCL);
      if (await checksum(destination) !== expected) throw new Error("copy checksum mismatch");
      // Conditional update protects a simultaneous migration/operator edit.
      const update = await db.file.updateMany({ where: { id: file.id, storageKey: file.storageKey, url: file.url }, data: { storageKey: key } });
      if (update.count !== 1) throw new Error("row changed concurrently; preserved copied file");
      await appendFile(progress, JSON.stringify({ fileId: file.id, key, sha256: expected, status: "done" }) + "\n", "utf8");
      console.log(`${file.id}: copied and verified`);
    } catch (error) {
      failures++;
      console.error(`${file.id}: ${error instanceof Error ? error.message : "migration error"}`);
    }
  }
  if (failures) process.exitCode = 1;
}
main().catch(() => { console.error("Upload migration failed"); process.exitCode = 1; }).finally(() => db.$disconnect());
