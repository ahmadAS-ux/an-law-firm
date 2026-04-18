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
import { Button } from "@/components/ui/button";
import { useI18n } from "@/contexts/language-context";

export default function TasksPage() {
  const { t } = useI18n();
  const [view, setView] = React.useState<"table" | "kanban">("table");
  const [tasks, setTasks] = React.useState<
    {
      id: string;
      title: string;
      status: string;
      priority: string;
      dueDate: string | null;
      case: { caseNumber: string; client: { name: string } } | null;
      assignedTo: { name: string };
    }[]
  >([]);

  React.useEffect(() => {
    void fetch("/api/tasks")
      .then((r) => r.json())
      .then((d) => setTasks(d.tasks ?? []));
  }, []);

  const cols = ["TODO", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button variant={view === "table" ? "default" : "outline"} onClick={() => setView("table")}>
          Table
        </Button>
        <Button variant={view === "kanban" ? "default" : "outline"} onClick={() => setView("kanban")}>
          Kanban
        </Button>
      </div>
      {view === "table" ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Case</TableHead>
              <TableHead>{t("tasks.client")}</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((x) => (
              <TableRow key={x.id}>
                <TableCell>
                  <Link className="text-heritage-gold" href={`/tasks/${x.id}`}>
                    {x.title}
                  </Link>
                </TableCell>
                <TableCell>{x.case?.caseNumber ?? "—"}</TableCell>
                <TableCell>
                  {x.case?.client ? (
                    <bdi dir="ltr">{x.case.client.name}</bdi>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>{x.assignedTo.name}</TableCell>
                <TableCell>
                  <Badge>{x.status}</Badge>
                </TableCell>
                <TableCell>
                  {x.dueDate ? new Date(x.dueDate).toLocaleDateString() : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {cols.map((col) => (
            <div key={col} className="rounded-md border border-heritage-gold/20 p-2">
              <div className="mb-2 font-medium">{col}</div>
              {tasks
                .filter((x) => x.status === col)
                .map((x) => (
                  <div key={x.id} className="mb-2 rounded bg-card p-2 text-sm">
                    <Link href={`/tasks/${x.id}`} className="text-heritage-gold">
                      {x.title}
                    </Link>
                  </div>
                ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
