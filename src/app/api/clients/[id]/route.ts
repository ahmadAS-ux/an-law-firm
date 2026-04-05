import { NextResponse } from "next/server";
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
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      cases: { include: { assignedTo: true } },
      workLogs: {
        take: 50,
        orderBy: { date: "desc" },
        include: { workType: true, case: true, user: true },
      },
    },
  });
  if (!client) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!hasPermission(user.role, "viewAllClients")) {
    const allowed = client.cases.some((c) => c.assignedToId === user.id);
    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const files = await prisma.file.findMany({
    where: { case: { clientId: id } },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { uploadedBy: true, case: true },
  });

  return NextResponse.json({ client, files });
}

export async function PUT(request: Request, ctx: Ctx) {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, "createClientCase")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await ctx.params;
  const body = await request.json().catch(() => ({}));

  const prev = await prisma.client.findUnique({ where: { id } });
  if (!prev) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const client = await prisma.client.update({
    where: { id },
    data: {
      name: body.name ?? prev.name,
      nameAr: body.nameAr ?? prev.nameAr,
      email: body.email ?? prev.email,
      phone: body.phone ?? prev.phone,
      address: body.address ?? prev.address,
      addressAr: body.addressAr ?? prev.addressAr,
      notes: body.notes ?? prev.notes,
      notesAr: body.notesAr ?? prev.notesAr,
      isActive: body.isActive ?? prev.isActive,
    },
  });

  await createAuditLog(user.id, "UPDATE", "Client", client.id, {
    before: prev,
    after: client,
  });

  return NextResponse.json({ client });
}
