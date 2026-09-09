import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { canReadFile, canDeleteFile } from "@/lib/file-access";
export const dynamic = "force-dynamic";
type Ctx = { params: { id: string } };
export async function GET(_request: Request, ctx: Ctx) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const file = await prisma.file.findFirst({ where: { id: ctx.params.id, deletedAt: null }, include: { case: true } });
  if (!file || !canReadFile(user, file)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { storageKey: _key, url: _url, ...fileDTO } = file; void _key; void _url;
  return NextResponse.json({ file: fileDTO });
}
export async function DELETE(_request: Request, ctx: Ctx) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const file = await prisma.file.findFirst({ where: { id: ctx.params.id, deletedAt: null } });
  if (!file) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!canDeleteFile(user, file)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await prisma.$transaction(async (tx) => {
    await tx.file.update({ where: { id: file.id }, data: { deletedAt: new Date() } });
    await tx.auditLog.create({ data: { userId: user.id, action: "DELETE", entityType: "File", entityId: file.id, details: JSON.stringify({ softDelete: true }) } });
  });
  return NextResponse.json({ ok: true });
}
