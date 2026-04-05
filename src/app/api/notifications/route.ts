import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const limit = Math.min(
    Number(searchParams.get("limit") ?? "50"),
    100,
  );
  const unreadOnly = searchParams.get("unread") === "1";

  const where = {
    userId: user.id,
    ...(unreadOnly ? { isRead: false } : {}),
  };

  const [items, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    prisma.notification.count({ where: { userId: user.id, isRead: false } }),
  ]);

  return NextResponse.json({ items, unreadCount });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const ids = body.ids as string[] | undefined;
  const markAll = body.markAll === true;

  if (markAll) {
    await prisma.notification.updateMany({
      where: { userId: user.id },
      data: { isRead: true },
    });
    return NextResponse.json({ ok: true });
  }
  if (ids?.length) {
    await prisma.notification.updateMany({
      where: { userId: user.id, id: { in: ids } },
      data: { isRead: true },
    });
  }
  return NextResponse.json({ ok: true });
}
