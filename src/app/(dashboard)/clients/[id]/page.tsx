"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useI18n } from "@/contexts/language-context";
import { PermissionGuard } from "@/components/role-guard";

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { lang, t } = useI18n();
  const [data, setData] = React.useState<{
    client: {
      id: string;
      name: string;
      nameAr: string;
      email: string;
      phone: string;
      address: string;
      notes: string;
      isActive: boolean;
      cases: { id: string; caseNumber: string; title: string; status: string }[];
    };
    files: { id: string; name: string; url: string }[];
  } | null>(null);

  React.useEffect(() => {
    void fetch(`/api/clients/${id}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, [id]);

  if (!data?.client) {
    return <div className="text-muted-foreground">{t("common.loading")}</div>;
  }

  const c = data.client;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">
          {lang === "ar" ? c.nameAr : c.name}
        </h2>
        <p className="text-sm text-muted-foreground">{c.name}</p>
        <Badge className="mt-2">{c.isActive ? t("status.active") : t("status.inactive")}</Badge>
      </div>
      <Card className="border-heritage-gold/20">
        <CardHeader>
          <CardTitle>Contact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <div>{c.email}</div>
          <div>{c.phone}</div>
          <div>{c.address}</div>
        </CardContent>
      </Card>
      <Tabs defaultValue="cases">
        <TabsList>
          <TabsTrigger value="cases">Cases</TabsTrigger>
          <TabsTrigger value="logs">Work logs</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
        </TabsList>
        <TabsContent value="cases">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {c.cases.map((cs) => (
                <TableRow key={cs.id}>
                  <TableCell>
                    <Link className="text-heritage-gold" href={`/cases/${cs.id}`}>
                      {cs.caseNumber}
                    </Link>
                  </TableCell>
                  <TableCell>{cs.title}</TableCell>
                  <TableCell>{cs.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="logs">
          <p className="text-sm text-muted-foreground">See work logs module</p>
        </TabsContent>
        <TabsContent value="files">
          <Table>
            <TableBody>
              {data.files.map((f) => (
                <TableRow key={f.id}>
                  <TableCell>
                    <a href={f.url} className="text-heritage-gold" target="_blank" rel="noreferrer">
                      {f.name}
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
      <PermissionGuard permission="viewAuditLog">
        <p className="text-xs text-muted-foreground">Audit trail available in Audit Log</p>
      </PermissionGuard>
    </div>
  );
}
