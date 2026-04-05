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

export default function AuditLogPage() {
  const [items, setItems] = React.useState<
    {
      id: string;
      createdAt: string;
      action: string;
      entityType: string;
      entityId: string;
      user: { name: string };
    }[]
  >([]);

  React.useEffect(() => {
    void fetch("/api/audit-log")
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []));
  }, []);

  return (
    <RoleGuard roles={["PARTNER", "ADMIN"]}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>When</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Entity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((a) => (
            <TableRow key={a.id}>
              <TableCell>{new Date(a.createdAt).toLocaleString()}</TableCell>
              <TableCell>{a.user.name}</TableCell>
              <TableCell>{a.action}</TableCell>
              <TableCell>
                {a.entityType} {a.entityId}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </RoleGuard>
  );
}
