import { NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { createAuditLog } from "@/lib/audit";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const f = await prisma.file.findUnique({
    where: { id },
    include: { case: true },
  });
  if (!f) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (user.role === "EMPLOYEE" && f.case.assignedToId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json({ file: f });
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, "manageFiles")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await ctx.params;
  const f = await prisma.file.findUnique({ where: { id } });
  if (!f) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const disk = path.join(process.cwd(), "public", f.url.replace(/^\//, ""));
  try {
    await unlink(disk);
  } catch {
    /* ignore */
  }
  await prisma.file.delete({ where: { id } });
  await createAuditLog(user.id, "DELETE", "File", id, {});
  return NextResponse.json({ ok: true });
}
