import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { createAuditLog } from "@/lib/audit";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, "manageUsers")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
    include: { team: true },
  });
  return NextResponse.json({ users });
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, "manageUsers")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await request.json().catch(() => ({}));
  const id = String(body.id ?? "");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  const prev = await prisma.user.findUnique({ where: { id } });
  if (!prev) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      role: body.role ?? prev.role,
      teamId: body.teamId === undefined ? prev.teamId : body.teamId || null,
      isActive: body.isActive ?? prev.isActive,
    },
    include: { team: true },
  });

  await createAuditLog(user.id, "UPDATE", "User", id, { before: prev, after: updated });
  return NextResponse.json({ user: updated });
}
