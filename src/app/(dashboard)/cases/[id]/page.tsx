"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18n } from "@/contexts/language-context";

export default function CaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useI18n();
  const [data, setData] = React.useState<{
    case: {
      caseNumber: string;
      title: string;
      status: string;
      priority: string;
      client: { id: string; name: string };
      assignedTo: { name: string };
      tasks: { id: string; title: string }[];
    };
  } | null>(null);

  React.useEffect(() => {
    void fetch(`/api/cases/${id}`)
      .then((r) => r.json())
      .then(setData);
  }, [id]);

  if (!data?.case) {
    return <div>{t("common.loading")}</div>;
  }

  const c = data.case;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-xl font-semibold text-heritage-gold">{c.caseNumber}</h2>
        <Badge>{c.status}</Badge>
        <Badge variant="outline">{c.priority}</Badge>
      </div>
      <h3 className="text-lg">{c.title}</h3>
      <p>
        <Link href={`/clients/${c.client.id}`} className="text-heritage-gold">
          {c.client.name}
        </Link>
      </p>
      <p className="text-sm text-muted-foreground">Assigned: {c.assignedTo.name}</p>
      <Tabs defaultValue="tasks">
        <TabsList>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="logs">Work logs</TabsTrigger>
        </TabsList>
        <TabsContent value="tasks">
          <ul className="list-inside list-disc text-sm">
            {c.tasks.map((x) => (
              <li key={x.id}>
                <Link href={`/tasks/${x.id}`} className="text-heritage-gold">
                  {x.title}
                </Link>
              </li>
            ))}
          </ul>
        </TabsContent>
        <TabsContent value="logs">
          <p className="text-sm text-muted-foreground">Filtered in work logs</p>
        </TabsContent>
      </Tabs>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={async () => {
            await fetch(`/api/cases/${id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: "ACTIVE" }),
            });
            void fetch(`/api/cases/${id}`)
              .then((r) => r.json())
              .then(setData);
          }}
        >
          Set Active
        </Button>
      </div>
    </div>
  );
}
