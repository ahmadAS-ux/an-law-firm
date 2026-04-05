"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/contexts/language-context";

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useI18n();
  const [data, setData] = React.useState<{
    task: {
      title: string;
      description: string;
      status: string;
      priority: string;
      dueDate: string | null;
      case: { id: string; caseNumber: string } | null;
      assignedTo: { name: string };
    };
  } | null>(null);

  React.useEffect(() => {
    void fetch(`/api/tasks/${id}`)
      .then((r) => r.json())
      .then(setData);
  }, [id]);

  if (!data?.task) {
    return <div>{t("common.loading")}</div>;
  }

  const x = data.task;

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">{x.title}</h2>
      <div className="flex gap-2">
        <Badge>{x.status}</Badge>
        <Badge variant="outline">{x.priority}</Badge>
      </div>
      {x.case && (
        <p>
          Case:{" "}
          <Link href={`/cases/${x.case.id}`} className="text-heritage-gold">
            {x.case.caseNumber}
          </Link>
        </p>
      )}
      <p className="text-sm text-muted-foreground">{x.description}</p>
      <p>Assigned: {x.assignedTo.name}</p>
      {x.dueDate && (
        <p>
          Due: {new Date(x.dueDate).toLocaleString()}
        </p>
      )}
      <Button
        onClick={async () => {
          await fetch(`/api/tasks/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "COMPLETED" }),
          });
          void fetch(`/api/tasks/${id}`)
            .then((r) => r.json())
            .then(setData);
        }}
      >
        Mark completed
      </Button>
    </div>
  );
}
