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

export default function CasesPage() {
  const { lang } = useI18n();
  const [cases, setCases] = React.useState<
    {
      id: string;
      caseNumber: string;
      title: string;
      status: string;
      priority: string;
      client: { name: string };
      assignedTo: { name: string };
      openDate: string;
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
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Assigned</TableHead>
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
              <TableCell>{lang === "ar" ? c.title : c.title}</TableCell>
              <TableCell>{c.client.name}</TableCell>
              <TableCell>
                <Badge>{c.status}</Badge>
              </TableCell>
              <TableCell>{c.priority}</TableCell>
              <TableCell>{c.assignedTo.name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
