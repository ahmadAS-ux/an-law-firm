import assert from "node:assert/strict";
import { spawn, type ChildProcess } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { seedReference } from "../prisma/seed/reference";
import { cleanupDemo, seedDemo } from "../prisma/seed/demo";
import { signSession } from "../src/lib/session-token";

const url = new URL(process.env.DATABASE_URL ?? "");
if (url.hostname !== "127.0.0.1" || url.port !== "55437") throw new Error("Integration harness requires the dedicated local port 55437");
const db = new PrismaClient();
const secret = "integration-signing-secret-at-least-32-bytes";
const basic = "Basic " + Buffer.from("test:test").toString("base64");
let checks = 0;
function pass(message: string) { checks++; console.log(`PASS ${checks}: ${message}`); }
const children: ChildProcess[] = [];
async function start(port: number, overrides: Record<string, string> = {}) {
  const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(port), "-H", "127.0.0.1"], {
    env: { ...process.env, NODE_ENV: "production", NEXTAUTH_SECRET: secret, DEV_LOGIN_SECRET: "test-secret", DEV_LOGIN_PICKER_ENABLED: "true", STAGING_BASIC_AUTH: "test:test", UPLOAD_DIR: path.resolve(".local-test/uploads"), ...overrides }, stdio: ["ignore", "pipe", "pipe"], windowsHide: true,
  });
  children.push(server);
  server.stderr?.on("data", (b) => { const message = b.toString(); if (message.includes("Error")) console.error(message); });
  const origin = `http://127.0.0.1:${port}`;
  for (let i = 0; i < 100; i++) {
    try { await fetch(origin + "/login", { headers: { Authorization: basic }, redirect: "manual" }); return origin; } catch { await new Promise((r) => setTimeout(r, 200)); }
  }
  throw new Error("Server did not start");
}
async function main() {
  process.env.ALLOW_DEMO_SEED = "true";
  await db.systemFlag.upsert({ where: { key: "DEMO_DATABASE" }, create: { key: "DEMO_DATABASE" }, update: {} });
  await seedReference(db);
  let fixture = await seedDemo(db);
  const first = fixture.users[0];
  const protectedClient = await db.client.create({ data: { name: "Protected fixture", nameAr: "اختبار", createdById: first.id } });
  await assert.rejects(cleanupDemo(db), /Protected incoming references/);
  assert.ok(await db.client.findUnique({ where: { id: protectedClient.id } }));
  await db.client.delete({ where: { id: protectedClient.id } });
  pass("demo cleanup refuses protected references without deleting them");
  const audit = await db.auditLog.create({ data: { userId: first.id, action: "TEST", entityType: "Test", entityId: "fixture" } });
  const cleanup = await cleanupDemo(db);
  assert.ok(cleanup.retained.includes(first.id));
  assert.equal((await db.user.findUniqueOrThrow({ where: { id: first.id } })).isActive, false);
  assert.ok(await db.auditLog.findUnique({ where: { id: audit.id } }));
  assert.equal(await db.task.count({ where: { isDemo: true } }), 0);
  pass("demo cleanup retains audited user and audit history, removes only demo targets");
  fixture = await seedDemo(db);
  const roles = await db.role.findMany();
  const employeeRole = roles.find((r) => r.name === "EMPLOYEE")!;
  const partnerRole = roles.find((r) => r.name === "PARTNER")!;
  const employee = fixture.users.find((u) => u.roleId === employeeRole.id)!;
  const partner = fixture.users.find((u) => u.roleId === partnerRole.id)!;
  const outsider = fixture.users.find((u) => u.roleId === roles.find((r) => r.name === "ACCOUNTANT")!.id)!;
  const permission = await db.permission.findUniqueOrThrow({ where: { key: "createMatter" } });
  await db.rolePermission.update({ where: { roleId_permissionId: { roleId: employeeRole.id, permissionId: permission.id } }, data: { granted: false, scope: "OWN" } });
  await seedReference(db); await seedReference(db);
  assert.equal((await db.rolePermission.findUniqueOrThrow({ where: { roleId_permissionId: { roleId: employeeRole.id, permissionId: permission.id } } })).scope, "OWN");
  pass("real PostgreSQL reference seed preserves editable choices");
  await mkdir("public/uploads", { recursive: true });
  await writeFile("public/uploads/test-deny.pdf", "private legacy fixture");
  const origin = await start(3317);
  const tokens = { employee: await signSession(employee.id, secret), partner: await signSession(partner.id, secret), outsider: await signSession(outsider.id, secret) };
  async function request(route: string, token?: string, init: RequestInit = {}, withBasic = true) {
    const headers = new Headers(init.headers);
    if (withBasic) headers.set("Authorization", basic);
    if (token) headers.set("Cookie", `an-auth=${token}`);
    return fetch(origin + route, { ...init, headers, redirect: "manual" });
  }
  assert.equal((await request("/api/tasks", undefined, {}, false)).status, 401);
  assert.equal((await request("/logo.png", undefined, {}, false)).status, 401);
  pass("Basic auth protects API and dotted assets");
  assert.equal((await request("/login")).status, 200);
  const buildId = (await readFile(".next/BUILD_ID", "utf8")).trim();
  assert.equal((await request(`/_next/static/${buildId}/_buildManifest.js`)).status, 200);
  assert.equal((await request("/tasks")).status, 307);
  pass("login assets load after Basic auth without a session; protected page redirects");
  assert.equal((await request("/api/tasks")).status, 401);
  assert.equal((await request("/api/tasks", "forged")).status, 401);
  assert.equal((await request("/api/tasks", await signSession(employee.id, secret, Math.floor(Date.now() / 1000) - 50000))).status, 401);
  pass("API rejects missing, forged and expired sessions as JSON 401");
  const login = (body: unknown) => request("/api/auth/login", undefined, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  assert.equal((await login({ userId: partner.id })).status, 401);
  assert.equal((await login({ userId: partner.id, devSecret: "wrong" })).status, 401);
  const accepted = await login({ userId: partner.id, devSecret: "test-secret" });
  assert.equal(accepted.status, 200);
  const dto = (await accepted.json()).user;
  assert.equal(dto.mfaEnabled, undefined); assert.equal(dto.isDemo, undefined);
  assert.deepEqual((await (await request("/api/auth/me", tokens.partner)).json()).user, dto);
  pass("picker requires secret; login and me share safe DTO");
  await db.user.update({ where: { id: employee.id }, data: { isActive: false } });
  assert.equal((await request("/api/tasks", tokens.employee)).status, 401);
  await db.user.update({ where: { id: employee.id }, data: { isActive: true, deletedAt: new Date() } });
  assert.equal((await request("/api/tasks", tokens.employee)).status, 401);
  await db.user.update({ where: { id: employee.id }, data: { deletedAt: null } });
  pass("handlers reject inactive and soft-deleted identities despite signed token");
  const file = await db.file.create({ data: { name: "legacy.pdf", originalName: "مستند.pdf", mimeType: "application/pdf", size: 22, url: "/uploads/test-deny.pdf", caseId: fixture.legalCase.id, uploadedById: partner.id, isDemo: true } });
  assert.equal((await request("/uploads/test-deny.pdf", undefined, {}, false)).status, 404);
  assert.equal((await request("/uploads/test-deny.pdf", tokens.partner)).status, 404);
  pass("existing legacy public file is denied both anonymously and with credentials");
  const download = `/api/files/${file.id}/download`;
  assert.equal((await request(download)).status, 401);
  assert.equal((await request(download, tokens.outsider)).status, 404);
  assert.ok(!(await (await request("/api/files", tokens.outsider)).json()).files.some((f: { id: string }) => f.id === file.id));
  const readable = await request(download, tokens.employee);
  assert.equal(readable.status, 200); assert.match(readable.headers.get("content-disposition")!, /^attachment;/);
  assert.equal(readable.headers.get("cache-control"), "private, no-store");
  assert.equal(await readable.text(), "private legacy fixture");
  assert.equal((await request(`/api/files/${file.id}`, tokens.employee, { method: "DELETE" })).status, 403);
  pass("list/download scope agrees; assigned employee can read but cannot delete");
  for (const storageKey of ["../.env", "C:\\Windows\\win.ini"]) {
    await db.file.update({ where: { id: file.id }, data: { storageKey } });
    assert.equal((await request(download, tokens.partner)).status, 404);
  }
  await db.file.update({ where: { id: file.id }, data: { storageKey: null } });
  pass("download rejects traversal and absolute storage keys");
  const form = new FormData(); form.set("caseId", fixture.legalCase.id); form.set("file", new Blob(["private upload"], { type: "application/pdf" }), "new.pdf");
  const uploaded = await request("/api/files", tokens.employee, { method: "POST", body: form });
  assert.equal(uploaded.status, 200);
  const uploadedId = (await uploaded.json()).file.id;
  const stored = await db.file.findUniqueOrThrow({ where: { id: uploadedId } });
  assert.equal(stored.url, null); assert.ok(stored.storageKey);
  assert.equal(await (await request(`/api/files/${uploadedId}/download`, tokens.employee)).text(), "private upload");
  assert.equal((await request(`/api/files/${uploadedId}`, tokens.partner, { method: "DELETE" })).status, 200);
  assert.ok((await db.file.findUniqueOrThrow({ where: { id: uploadedId } })).deletedAt);
  assert.equal((await request(`/api/files/${uploadedId}/download`, tokens.partner)).status, 404);
  pass("new uploads use private storage; partner deletion is soft and hides download");
  const violation = await request("/api/permissions/matrix", tokens.partner, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify([{ roleId: partnerRole.id, permissionId: permission.id, granted: false, scope: "OWN" }]) });
  assert.equal(violation.status, 409);
  assert.ok(await db.auditLog.findFirst({ where: { action: "PERMISSION_LOCK_VIOLATION", userId: partner.id } }));
  pass("locked matrix edit rejected and audited");
  const disabled = await start(3318, { DEV_LOGIN_PICKER_ENABLED: "false" });
  assert.equal((await fetch(disabled + "/api/auth/users", { headers: { Authorization: basic } })).status, 404);
  assert.equal((await fetch(disabled + "/api/auth/login", { method: "POST", headers: { Authorization: basic } })).status, 404);
  pass("picker disabled by server flag");
  const noSecret = await start(3319, { NEXTAUTH_SECRET: "" });
  assert.equal((await fetch(noSecret + "/api/auth/login", { method: "POST", headers: { Authorization: basic, "Content-Type": "application/json" }, body: JSON.stringify({ userId: partner.id, devSecret: "test-secret" }) })).status, 503);
  pass("missing signing secret fails closed");
  console.log(`All ${checks} integration checks passed`);
}
main().catch((error: unknown) => { console.error(error); process.exitCode = 1; }).finally(async () => { for (const child of children) child.kill(); await db.$disconnect(); });
