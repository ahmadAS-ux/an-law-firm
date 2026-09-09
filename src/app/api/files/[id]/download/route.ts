import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { canReadFile } from "@/lib/file-access";
import { readableFilePath } from "@/lib/file-storage";
import { createAuditLog } from "@/lib/audit";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export async function GET(_request: Request, ctx: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const file = await prisma.file.findFirst({ where: { id: ctx.params.id, deletedAt: null }, include: { case: true } });
  if (!file || !canReadFile(user, file)) return new NextResponse(null, { status: 404 });
  let disk: string;
  try { disk = await readableFilePath(file); if (!(await stat(disk)).isFile()) return new NextResponse(null, { status: 404 }); }
  catch { return new NextResponse(null, { status: 404 }); }
  if (!file.storageKey) console.info("Legacy authenticated file fallback", file.id);
  await createAuditLog(user.id, "FILE_DOWNLOAD", "File", file.id, { legacy: !file.storageKey });
  const filename = encodeURIComponent(file.originalName).replace(/['()*]/g, (c) => `%${c.charCodeAt(0).toString(16)}`);
  return new Response(Readable.toWeb(createReadStream(disk)) as ReadableStream<Uint8Array>, { headers: {
    "Content-Type": file.mimeType || "application/octet-stream", "Content-Disposition": `attachment; filename*=UTF-8''${filename}`,
    "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff",
  } });
}
