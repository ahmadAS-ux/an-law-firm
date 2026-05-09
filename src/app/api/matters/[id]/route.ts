import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { createAuditLog } from "@/lib/audit";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const matter = await prisma.matter.findFirst({
    where: { id: params.id, deletedAt: null },
    include: {
      client: true,
      department: true,
      assignedTo: { select: { id: true, name: true, nameAr: true } },
      approvedBy: { select: { id: true, name: true, nameAr: true } },
    },
  });
  if (!matter) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ matter });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const matter = await prisma.matter.findFirst({
    where: { id: params.id, deletedAt: null },
    include: { department: true },
  });
  if (!matter) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json().catch(() => ({}));

  // Approval action
  if (body.action === "approve") {
    const isPartner = user.role === "PARTNER";
    const isOwnDeptManager =
      user.role === "MANAGER" && user.departmentId === matter.departmentId;
    if (!isPartner && !isOwnDeptManager) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const updated = await prisma.matter.update({
      where: { id: params.id },
      data: {
        status: "ACTIVE",
        approvedById: user.id,
        approvedAt: new Date(),
      },
    });
    await createAuditLog(user.id, "UPDATE", "Matter", matter.id, {
      action: "approve",
      from: "PENDING_APPROVAL",
      to: "ACTIVE",
    });
    return NextResponse.json({ matter: updated });
  }

  // Status/field update — requires editApprovedMatter for ACTIVE matters
  if (
    matter.status !== "PENDING_APPROVAL" &&
    !hasPermission(user.role, "editApprovedMatter")
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.matter.update({
    where: { id: params.id },
    data: {
      ...(body.title !== undefined && { title: String(body.title) }),
      ...(body.titleAr !== undefined && { titleAr: String(body.titleAr) }),
      ...(body.description !== undefined && { description: String(body.description) }),
      ...(body.status !== undefined && { status: body.status }),
    },
  });
  await createAuditLog(user.id, "UPDATE", "Matter", matter.id, { fields: Object.keys(body) });
  return NextResponse.json({ matter: updated });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, "deleteMatter")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const matter = await prisma.matter.findFirst({
    where: { id: params.id, deletedAt: null },
  });
  if (!matter) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.matter.update({
    where: { id: params.id },
    data: { deletedAt: new Date() },
  });
  await createAuditLog(user.id, "DELETE", "Matter", params.id, { soft: true });
  return NextResponse.json({ ok: true });
}
