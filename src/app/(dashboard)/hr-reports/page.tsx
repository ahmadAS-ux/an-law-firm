"use client";

import * as React from "react";
import { Pie, PieChart, ResponsiveContainer, Cell } from "recharts";
import { PermissionGuard } from "@/components/role-guard";

const COLORS = ["#B8963E", "#3D3D3D", "#888", "#555", "#222"];

export default function HrReportsPage() {
  const [data, setData] = React.useState<{ name: string; totalHours: number }[]>([]);

  React.useEffect(() => {
    void fetch("/api/reports?type=clientHours")
      .then((r) => r.json())
      .then((d) => {
        setData(
          (d.rows ?? []).map(
            (x: { client?: { name: string }; totalHours: number }) => ({
              name: x.client?.name ?? "?",
              totalHours: x.totalHours,
            }),
          ),
        );
      });
  }, []);

  return (
    <PermissionGuard permission="viewHRReports">
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="totalHours"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </PermissionGuard>
  );
}
