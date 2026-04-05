import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

function highlight(term: string, text: string) {
  if (!term) return text;
  const i = text.toLowerCase().indexOf(term.toLowerCase());
  if (i < 0) return text;
  return `${text.slice(0, i)}«${text.slice(i, i + term.length)}»${text.slice(i + term.length)}`;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const term = String(body.searchTerm ?? "").trim();
  if (!term) {
    return NextResponse.json({ error: "searchTerm required" }, { status: 400 });
  }

  const clients = await prisma.client.findMany({
    where: {
      OR: [
        { name: { contains: term } },
        { nameAr: { contains: term } },
      ],
    },
    take: 50,
  });
  const cases = await prisma.case.findMany({
    where: {
      OR: [
        { title: { contains: term } },
        { titleAr: { contains: term } },
        { caseNumber: { contains: term } },
      ],
    },
    take: 50,
    include: { client: true },
  });

  const results = [
    ...clients.map((c) => ({
      type: "Client" as const,
      id: c.id,
      name: highlight(term, c.name),
      nameAr: highlight(term, c.nameAr),
      status: c.isActive ? "Active" : "Inactive",
      confidence: "high",
    })),
    ...cases.map((c) => ({
      type: "Case" as const,
      id: c.id,
      name: highlight(term, c.title),
      nameAr: highlight(term, c.titleAr),
      status: c.status,
      confidence: "high",
    })),
  ];

  const record = await prisma.conflictCheck.create({
    data: {
      searchTerm: term,
      searchTermAr: String(body.searchTermAr ?? term),
      results: JSON.stringify(results),
      performedById: user.id,
    },
  });

  return NextResponse.json({ results, id: record.id });
}
