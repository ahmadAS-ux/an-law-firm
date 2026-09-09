import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hasPermissionDb } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !user.isActive) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cfg = await prisma.reportConfig.findUnique({ where: { id: "default" } });
  return NextResponse.json(cfg ?? { id: "default" });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user || !user.isActive) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const allowed = await hasPermissionDb(user.id, "systemSettings");
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const {
    workweekDays,
    standardHoursPerDay,
    targetHoursPartner,
    targetHoursManager,
    targetHoursEmployee,
    targetHoursAdminStaff,
    targetHoursAccountant,
    lateEntryThresholdDays,
  } = body;

  const cfg = await prisma.reportConfig.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      ...(workweekDays !== undefined && { workweekDays }),
      ...(standardHoursPerDay !== undefined && { standardHoursPerDay }),
      ...(targetHoursPartner !== undefined && { targetHoursPartner }),
      ...(targetHoursManager !== undefined && { targetHoursManager }),
      ...(targetHoursEmployee !== undefined && { targetHoursEmployee }),
      ...(targetHoursAdminStaff !== undefined && { targetHoursAdminStaff }),
      ...(targetHoursAccountant !== undefined && { targetHoursAccountant }),
      ...(lateEntryThresholdDays !== undefined && { lateEntryThresholdDays }),
    },
    update: {
      ...(workweekDays !== undefined && { workweekDays }),
      ...(standardHoursPerDay !== undefined && { standardHoursPerDay }),
      ...(targetHoursPartner !== undefined && { targetHoursPartner }),
      ...(targetHoursManager !== undefined && { targetHoursManager }),
      ...(targetHoursEmployee !== undefined && { targetHoursEmployee }),
      ...(targetHoursAdminStaff !== undefined && { targetHoursAdminStaff }),
      ...(targetHoursAccountant !== undefined && { targetHoursAccountant }),
      ...(lateEntryThresholdDays !== undefined && { lateEntryThresholdDays }),
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "UPDATE_REPORT_CONFIG",
      entityType: "ReportConfig",
      entityId: "default",
      category: "SYSTEM",
      details: JSON.stringify(body),
    },
  });

  return NextResponse.json(cfg);
}
