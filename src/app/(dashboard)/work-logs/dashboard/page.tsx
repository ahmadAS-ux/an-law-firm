"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { PermissionGuard } from "@/components/role-guard";

export default function WorkLogsDashboardPage() {
  const [data, setData] = React.useState<{ name: string; hours: number }[]>([]);

  React.useEffect(() => {
    void fetch("/api/reports?type=employee")
      .then((r) => r.json())
      .then((d) => {
        const rows = (d.rows ?? []).map(
          (x: { user?: { name: string }; totalHours: number }) => ({
            name: x.user?.name ?? "?",
            hours: x.totalHours,
          }),
        );
        setData(rows);
      });
  }, []);

  return (
    <PermissionGuard permission="approveWorkLogs">
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Bar dataKey="hours" fill="#B8963E" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </PermissionGuard>
  );
}
