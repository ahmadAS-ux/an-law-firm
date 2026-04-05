import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const types = await prisma.workType.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { workLogs: true } } },
  });
  return NextResponse.json({ workTypes: types });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await request.json().catch(() => ({}));
  const wt = await prisma.workType.create({
    data: {
      name: String(body.name ?? "Type"),
      nameAr: String(body.nameAr ?? ""),
      description: String(body.description ?? ""),
      descriptionAr: String(body.descriptionAr ?? ""),
      isActive: body.isActive !== false,
    },
  });
  await createAuditLog(user.id, "CREATE", "WorkType", wt.id, { name: wt.name });
  return NextResponse.json({ workType: wt });
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await request.json().catch(() => ({}));
  const id = String(body.id ?? "");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  const prev = await prisma.workType.findUnique({ where: { id } });
  if (!prev) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const wt = await prisma.workType.update({
    where: { id },
    data: {
      name: body.name ?? prev.name,
      nameAr: body.nameAr ?? prev.nameAr,
      description: body.description ?? prev.description,
      descriptionAr: body.descriptionAr ?? prev.descriptionAr,
      isActive: body.isActive ?? prev.isActive,
    },
  });
  await createAuditLog(user.id, "UPDATE", "WorkType", id, {});
  return NextResponse.json({ workType: wt });
}
