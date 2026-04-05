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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function UsersPage() {
  const [users, setUsers] = React.useState<
    {
      id: string;
      name: string;
      nameAr: string;
      email: string;
      role: string;
      isActive: boolean;
      team: { name: string } | null;
    }[]
  >([]);

  React.useEffect(() => {
    void fetch("/api/users")
      .then((r) => r.json())
      .then((d) => setUsers(d.users ?? []));
  }, []);

  async function updateRole(id: string, role: string) {
    await fetch("/api/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, role }),
    });
    void fetch("/api/users")
      .then((r) => r.json())
      .then((d) => setUsers(d.users ?? []));
  }

  return (
    <RoleGuard roles={["ADMIN"]}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>Active</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u.id}>
              <TableCell>
                {u.name} / {u.nameAr}
              </TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>
                <Select
                  value={u.role}
                  onValueChange={(v) => v && void updateRole(u.id, v)}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PARTNER">PARTNER</SelectItem>
                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                    <SelectItem value="MANAGER">MANAGER</SelectItem>
                    <SelectItem value="EMPLOYEE">EMPLOYEE</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>{u.team?.name ?? "—"}</TableCell>
              <TableCell>
                <Badge>{u.isActive ? "Yes" : "No"}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </RoleGuard>
  );
}
