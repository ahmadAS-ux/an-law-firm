import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { createAuditLog } from "@/lib/audit";
import { Prisma } from "@prisma/client";

async function nextMatterNumber(): Promise<string> {
  const rows = await prisma.matter.findMany({ select: { matterNumber: true } });
  let max = 0;
  for (const r of rows) {
    const p = r.matterNumber.match(/MTR-2026-(\d+)/);
    if (p) max = Math.max(max, parseInt(p[1], 10));
  }
  return `MTR-2026-${String(max + 1).padStart(4, "0")}`;
}

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status");
  const clientId = searchParams.get("clientId");
  const departmentId = searchParams.get("departmentId");

  const where: Prisma.MatterWhereInput = { deletedAt: null };

  if (user.role === "EMPLOYEE") {
    where.assignedToId = user.id;
  }
  if (search) {
    where.OR = [
      { matterNumber: { contains: search.toUpperCase() } },
      { title: { contains: search } },
      { titleAr: { contains: search } },
    ];
  }
  if (status) where.status = status as Prisma.EnumMatterStatusFilter;
  if (clientId) where.clientId = clientId;
  if (departmentId) where.departmentId = departmentId;

  const matters = await prisma.matter.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      client: true,
      department: true,
      assignedTo: { select: { id: true, name: true, nameAr: true } },
      approvedBy: { select: { id: true, name: true, nameAr: true } },
    },
  });
  return NextResponse.json({ matters });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, "createClientCase")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await request.json().catch(() => ({}));
  const clientId = String(body.clientId ?? "");
  const departmentId = String(body.departmentId ?? "");
  if (!clientId || !departmentId) {
    return NextResponse.json(
      { error: "clientId and departmentId required" },
      { status: 400 },
    );
  }

  const matterNumber = await nextMatterNumber();
  const matter = await prisma.matter.create({
    data: {
      matterNumber,
      title: String(body.title ?? "Untitled"),
      titleAr: String(body.titleAr ?? ""),
      description: String(body.description ?? ""),
      status: "PENDING_APPROVAL",
      clientId,
      departmentId,
      assignedToId: user.id,
    },
    include: {
      client: true,
      department: true,
      assignedTo: { select: { id: true, name: true, nameAr: true } },
    },
  });

  await createAuditLog(user.id, "CREATE", "Matter", matter.id, { matterNumber });

  return NextResponse.json({ matter });
}
