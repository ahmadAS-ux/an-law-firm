import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { createAuditLog } from "@/lib/audit";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
]);

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const caseId = searchParams.get("caseId");

  const where: { caseId?: string; case?: { assignedToId?: string } } = {};
  if (caseId) where.caseId = caseId;
  if (user.role === "EMPLOYEE") {
    where.case = { assignedToId: user.id };
  }

  const files = await prisma.file.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { case: { include: { client: true } }, uploadedBy: true },
  });
  return NextResponse.json({ files });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const form = await request.formData();
  const file = form.get("file");
  const caseId = String(form.get("caseId") ?? "");
  if (!(file instanceof Blob) || !caseId) {
    return NextResponse.json({ error: "file and caseId required" }, { status: 400 });
  }

  const mimeType = (file as File).type || "application/octet-stream";
  if (!ALLOWED.has(mimeType)) {
    return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
  }
  if ((file as File).size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large" }, { status: 400 });
  }

  const c = await prisma.case.findUnique({ where: { id: caseId } });
  if (!c) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }
  const mayUpload =
    hasPermission(user.role, "manageFiles") || c.assignedToId === user.id;
  if (!mayUpload) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const originalName = (file as File).name || "upload";
  const safeBase = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const existing = await prisma.file.findMany({
    where: { caseId, name: safeBase },
    orderBy: { version: "desc" },
    take: 1,
  });
  const version = existing[0] ? existing[0].version + 1 : 1;

  await mkdir(UPLOAD_DIR, { recursive: true });
  const buf = Buffer.from(await file.arrayBuffer());
  const diskName = `${caseId}-${version}-${Date.now()}-${safeBase}`;
  const fsPath = path.join(UPLOAD_DIR, diskName);
  await writeFile(fsPath, buf);

  const url = `/uploads/${diskName}`;
  const rec = await prisma.file.create({
    data: {
      name: safeBase,
      originalName,
      mimeType,
      size: buf.length,
      url,
      caseId,
      uploadedById: user.id,
      version,
    },
  });

  await createAuditLog(user.id, "CREATE", "File", rec.id, { name: safeBase });
  return NextResponse.json({ file: rec });
}
