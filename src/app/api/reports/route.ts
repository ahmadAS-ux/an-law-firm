import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, "viewHRReports")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const report = searchParams.get("type") ?? "employee";

  const dateFilter =
    from || to
      ? {
          date: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          },
        }
      : {};

  if (report === "employee") {
    const logs = await prisma.workLog.groupBy({
      by: ["userId"],
      where: dateFilter,
      _sum: { hours: true },
    });
    const users = await prisma.user.findMany({
      where: { id: { in: logs.map((l) => l.userId) } },
    });
    return NextResponse.json({
      rows: logs.map((l) => ({
        userId: l.userId,
        totalHours: l._sum.hours ?? 0,
        user: users.find((u) => u.id === l.userId),
      })),
    });
  }

  if (report === "clientHours") {
    const logs = await prisma.workLog.groupBy({
      by: ["clientId"],
      where: dateFilter,
      _sum: { hours: true },
    });
    const clients = await prisma.client.findMany({
      where: { id: { in: logs.map((l) => l.clientId) } },
    });
    return NextResponse.json({
      rows: logs.map((l) => ({
        clientId: l.clientId,
        totalHours: l._sum.hours ?? 0,
        client: clients.find((c) => c.id === l.clientId),
      })),
    });
  }

  if (report === "overdueTasks") {
    const tasks = await prisma.task.findMany({
      where: {
        status: { not: "COMPLETED" },
        dueDate: { lt: new Date() },
      },
      include: { assignedTo: true },
    });
    return NextResponse.json({ tasks });
  }

  return NextResponse.json({ ok: true });
}
