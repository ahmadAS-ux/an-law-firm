"use client";

import * as React from "react";
import { RoleGuard } from "@/components/role-guard";
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

export default function ServicesPage() {
  const { t } = useI18n();
  const [types, setTypes] = React.useState<
    { id: string; name: string; nameAr: string; isActive: boolean; _count: { workLogs: number } }[]
  >([]);

  React.useEffect(() => {
    void fetch("/api/work-types")
      .then((r) => r.json())
      .then((d) => setTypes(d.workTypes ?? []));
  }, []);

  return (
    <RoleGuard roles={["ADMIN"]}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>AR</TableHead>
            <TableHead>Active</TableHead>
            <TableHead># Logs</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {types.map((w) => (
            <TableRow key={w.id}>
              <TableCell>{w.name}</TableCell>
              <TableCell>{w.nameAr}</TableCell>
              <TableCell>
                <Badge>{w.isActive ? t("status.active") : t("status.inactive")}</Badge>
              </TableCell>
              <TableCell>{w._count.workLogs}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </RoleGuard>
  );
}
