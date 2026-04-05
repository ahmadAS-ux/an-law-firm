"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useI18n } from "@/contexts/language-context";

export default function MyLogsPage() {
  const { t } = useI18n();
  const [logs, setLogs] = React.useState<
    {
      id: string;
      date: string;
      hours: number;
      isBillable: boolean;
      isApproved: boolean;
      client: { name: string };
      case: { caseNumber: string };
      workType: { name: string };
    }[]
  >([]);

  React.useEffect(() => {
    void fetch("/api/work-logs?scope=mine")
      .then((r) => r.json())
      .then((d) => setLogs(d.logs ?? []));
  }, []);

  const total = logs.reduce((s, l) => s + l.hours, 0);

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Case</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Hours</TableHead>
            <TableHead>Approved</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((l) => (
            <TableRow key={l.id}>
              <TableCell>{new Date(l.date).toLocaleDateString()}</TableCell>
              <TableCell>{l.client.name}</TableCell>
              <TableCell>{l.case.caseNumber}</TableCell>
              <TableCell>{l.workType.name}</TableCell>
              <TableCell>{l.hours}</TableCell>
              <TableCell>{l.isApproved ? t("common.yes") : t("common.no")}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <p className="text-sm">Total hours: {total.toFixed(2)}</p>
    </div>
  );
}
