"use client";

import * as React from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/contexts/language-context";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

export default function CasesPage() {
  const { t } = useI18n();
  const [cases, setCases] = React.useState<
    {
      id: string;
      caseNumber: string;
      title: string;
      status: string;
      priority: string;
      client: { name: string };
      assignedTo: { name: string };
      createdAt: string;
    }[]
  >([]);

  React.useEffect(() => {
    void fetch("/api/cases")
      .then((r) => r.json())
      .then((d) => setCases(d.cases ?? []));
  }, []);

  return (
    <div className="overflow-x-auto rounded-md border border-heritage-gold/20">
      <Table>
        <colgroup>
          <col className="w-36" />
          <col className="w-auto" />
          <col className="w-40" />
          <col className="w-28" />
          <col className="w-28" />
          <col className="w-36" />
          <col className="w-32" />
        </colgroup>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>{t("cases.title")}</TableHead>
            <TableHead>{t("workLog.client")}</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Assigned</TableHead>
            <TableHead>{t("cases.dateOpened")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cases.map((c) => (
            <TableRow key={c.id}>
              <TableCell>
                <Link className="text-heritage-gold" href={`/cases/${c.id}`}>
                  {c.caseNumber}
                </Link>
              </TableCell>
              <TableCell>{c.title}</TableCell>
              <TableCell>{c.client.name}</TableCell>
              <TableCell>
                <Badge>{c.status}</Badge>
              </TableCell>
              <TableCell>{c.priority}</TableCell>
              <TableCell>{c.assignedTo.name}</TableCell>
              <TableCell>{formatDate(c.createdAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
