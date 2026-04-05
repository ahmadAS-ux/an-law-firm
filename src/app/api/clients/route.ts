import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { createAuditLog } from "@/lib/audit";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status");

  const baseWhere: Prisma.ClientWhereInput = {};
  if (status === "active") baseWhere.isActive = true;
  if (status === "inactive") baseWhere.isActive = false;

  if (search) {
    baseWhere.OR = [
      { name: { contains: search } },
      { nameAr: { contains: search } },
      { email: { contains: search } },
    ];
  }

  if (!hasPermission(user.role, "viewAllClients")) {
    const caseRows = await prisma.case.findMany({
      where: { assignedToId: user.id },
      select: { clientId: true },
    });
    const ids = Array.from(new Set(caseRows.map((c) => c.clientId)));
    if (ids.length === 0) {
      return NextResponse.json({ clients: [] });
    }
    baseWhere.id = { in: ids };
  }

  const clients = await prisma.client.findMany({
    where: baseWhere,
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { cases: true } },
    },
  });

  return NextResponse.json({ clients });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, "createClientCase")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await request.json().catch(() => ({}));

  const name = String(body.name ?? "").trim();
  if (!name) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }

  const dup = await prisma.client.findFirst({
    where: {
      OR: [
        { name: { equals: name } },
        { nameAr: { equals: String(body.nameAr ?? "").trim() } },
      ],
    },
  });
  if (dup) {
    return NextResponse.json(
      { error: "Possible duplicate client", code: "CONFLICT" },
      { status: 409 },
    );
  }

  const client = await prisma.client.create({
    data: {
      name,
      nameAr: String(body.nameAr ?? name).trim(),
      email: String(body.email ?? ""),
      phone: String(body.phone ?? ""),
      address: String(body.address ?? ""),
      addressAr: String(body.addressAr ?? ""),
      notes: String(body.notes ?? ""),
      notesAr: String(body.notesAr ?? ""),
      isActive: body.isActive !== false,
      createdById: user.id,
    },
  });

  await createAuditLog(user.id, "CREATE", "Client", client.id, {
    name: client.name,
  });

  return NextResponse.json({ client });
}
