import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [activeCases, pendingTasks, weekLogs, unread] = await Promise.all([
    prisma.case.count({
      where: {
        status: { in: ["OPEN", "ACTIVE"] },
        ...(user.role === "EMPLOYEE"
          ? { assignedToId: user.id }
          : {}),
      },
    }),
    prisma.task.count({
      where: {
        status: { in: ["TODO", "IN_PROGRESS"] },
        ...(user.role === "EMPLOYEE" ? { assignedToId: user.id } : {}),
      },
    }),
    prisma.workLog.aggregate({
      where: {
        userId: user.role === "EMPLOYEE" ? user.id : undefined,
        date: { gte: weekAgo },
      },
      _sum: { hours: true },
    }),
    prisma.notification.count({
      where: { userId: user.id, isRead: false },
    }),
  ]);

  return NextResponse.json({
    activeCases,
    pendingTasks,
    hoursThisWeek: weekLogs._sum.hours ?? 0,
    unreadNotifications: unread,
  });
}
