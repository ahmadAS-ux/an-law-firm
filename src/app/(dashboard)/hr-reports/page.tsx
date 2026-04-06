"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/auth-provider";
import { useI18n } from "@/contexts/language-context";
import { hasPermission } from "@/lib/permissions";
import {
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  Clock,
  TrendingUp,
  Users,
  BarChart2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type WorkLogRow = {
  id: string;
  date: string;
  hours: number;
  isBillable: boolean;
  workType: string;
  workTypeAr: string;
  client: string;
  caseNumber: string;
  caseTitle: string;
  notes: string;
};

type EmployeeRow = {
  userId: string;
  name: string;
  nameAr: string;
  role: string;
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  billableRatio: number;
  casesCount: number;
  caseNumbers: string[];
  logs: WorkLogRow[];
};

type Totals = {
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  billableRatio: number;
};

type PickUser = { id: string; name: string; nameAr: string; role: string };

type SortableKey = "name" | "role" | "totalHours" | "billableHours" | "nonBillableHours" | "billableRatio" | "casesCount";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function weekRange() {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const mon = new Date(now);
  mon.setDate(now.getDate() - ((day + 6) % 7));
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  return { from: fmt(mon), to: fmt(sun) };
}

function monthRange() {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { from: fmt(first), to: fmt(last) };
}

function fmt(d: Date) {
  return d.toISOString().slice(0, 10);
}

function roleLabel(role: string, t: (k: string) => string) {
  return t(`roles.${role}`) || role;
}

// ─── CSV export ───────────────────────────────────────────────────────────────
function exportCsv(rows: EmployeeRow[], lang: "ar" | "en") {
  const headers = [
    "Employee",
    "Role",
    "Total Hours",
    "Billable Hours",
    "Non-Billable Hours",
    "Billable %",
    "Cases",
  ];
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      [
        lang === "ar" ? r.nameAr : r.name,
        r.role,
        r.totalHours,
        r.billableHours,
        r.nonBillableHours,
        r.billableRatio + "%",
        r.casesCount,
      ].join(","),
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `hr-report-${fmt(new Date())}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon: Icon,
  gold,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  gold?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-heritage-gold/20 bg-[#252525] p-4">
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <div
        className={`text-2xl font-bold ${gold ? "text-heritage-gold" : "text-white"}`}
      >
        {value}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HrReportsPage() {
  const { user, isLoading } = useAuth();
  const { t, lang } = useI18n();
  const router = useRouter();

  // Redirect employees
  React.useEffect(() => {
    if (!isLoading && user && !hasPermission(user.role, "viewHRReports")) {
      router.replace("/");
    }
  }, [isLoading, user, router]);

  // ── Filter state ──────────────────────────────────────────────────────────
  const initial = weekRange();
  const [quickRange, setQuickRange] = React.useState<"week" | "month" | "custom">("week");
  const [from, setFrom] = React.useState(initial.from);
  const [to, setTo] = React.useState(initial.to);
  const [employeeId, setEmployeeId] = React.useState("all");
  const [billableFilter, setBillableFilter] = React.useState("all");

  // ── Data state ────────────────────────────────────────────────────────────
  const [rows, setRows] = React.useState<EmployeeRow[]>([]);
  const [totals, setTotals] = React.useState<Totals | null>(null);
  const [employees, setEmployees] = React.useState<PickUser[]>([]);
  const [fetching, setFetching] = React.useState(false);
  const [expandedRow, setExpandedRow] = React.useState<string | null>(null);
  const [sortKey, setSortKey] = React.useState<SortableKey>("totalHours");
  const [sortAsc, setSortAsc] = React.useState(false);

  // Load employee list for filter dropdown
  React.useEffect(() => {
    void fetch("/api/auth/users")
      .then((r) => r.json())
      .then((d) => setEmployees(d.users ?? []));
  }, []);

  // Apply quick range
  function applyQuick(mode: "week" | "month" | "custom") {
    setQuickRange(mode);
    if (mode === "week") {
      const r = weekRange();
      setFrom(r.from);
      setTo(r.to);
    } else if (mode === "month") {
      const r = monthRange();
      setFrom(r.from);
      setTo(r.to);
    }
  }

  // Fetch report
  const fetchReport = React.useCallback(() => {
    if (!user) return;
    setFetching(true);
    const params = new URLSearchParams({ type: "hr", from, to });
    if (employeeId !== "all") params.set("employeeId", employeeId);
    if (billableFilter !== "all") params.set("billable", billableFilter === "billable" ? "true" : "false");
    void fetch(`/api/reports?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setRows(d.rows ?? []);
        setTotals(d.totals ?? null);
      })
      .finally(() => setFetching(false));
  }, [user, from, to, employeeId, billableFilter]);

  React.useEffect(() => {
    if (!isLoading && user && hasPermission(user.role, "viewHRReports")) {
      fetchReport();
    }
  }, [fetchReport, isLoading, user]);

  // Sorting
  function toggleSort(key: SortableKey) {
    if (sortKey === key) setSortAsc((v) => !v);
    else {
      setSortKey(key);
      setSortAsc(false);
    }
  }

  const sorted = React.useMemo(() => {
    return [...rows].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp = typeof av === "number" && typeof bv === "number"
        ? av - bv
        : String(av).localeCompare(String(bv));
      return sortAsc ? cmp : -cmp;
    });
  }, [rows, sortKey, sortAsc]);

  // Chart data
  const chartData = sorted.map((r) => ({
    name: lang === "ar" ? r.nameAr : r.name,
    [t("hr.billableHours")]: r.billableHours,
    [t("hr.nonBillableHours")]: r.nonBillableHours,
  }));

  if (isLoading || !user) return null;
  if (!hasPermission(user.role, "viewHRReports")) return null;

  const isPartnerOrAdmin = user.role === "PARTNER" || user.role === "ADMIN";

  const SortIcon = ({ col }: { col: SortableKey }) =>
    sortKey !== col ? (
      <span className="opacity-30 text-xs">↕</span>
    ) : sortAsc ? (
      <ChevronUp className="inline h-3 w-3" />
    ) : (
      <ChevronDown className="inline h-3 w-3" />
    );

  return (
    <div className="flex flex-col gap-6 p-1">
      {/* ── Title + Export ───────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-white">{t("hrReports.title")}</h1>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-heritage-gold/40 text-heritage-gold hover:bg-heritage-gold/10"
            onClick={() => exportCsv(sorted, lang)}
          >
            <Download className="me-1.5 h-4 w-4" />
            {t("hr.exportCsv")}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-heritage-gold/40 text-heritage-gold hover:bg-heritage-gold/10"
            onClick={() => window.print()}
          >
            <FileText className="me-1.5 h-4 w-4" />
            {t("hr.exportPdf")}
          </Button>
        </div>
      </div>

      {/* ── Filters ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 rounded-lg border border-heritage-gold/20 bg-[#252525] p-4">
        {/* Quick range buttons */}
        <div className="flex gap-1.5">
          {(["week", "month", "custom"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => applyQuick(mode)}
              className={`rounded px-3 py-1.5 text-sm transition-colors ${
                quickRange === mode
                  ? "bg-heritage-gold text-near-black font-medium"
                  : "border border-heritage-gold/30 text-gray-300 hover:border-heritage-gold/60"
              }`}
            >
              {t(`hr.${mode === "week" ? "thisWeek" : mode === "month" ? "thisMonth" : "custom"}`)}
            </button>
          ))}
        </div>

        {/* Date inputs */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">{t("hr.filterFrom")}</span>
          <input
            type="date"
            value={from}
            onChange={(e) => { setFrom(e.target.value); setQuickRange("custom"); }}
            className="rounded border border-heritage-gold/30 bg-near-black px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-heritage-gold/50"
          />
          <span className="text-sm text-gray-400">{t("hr.filterTo")}</span>
          <input
            type="date"
            value={to}
            onChange={(e) => { setTo(e.target.value); setQuickRange("custom"); }}
            className="rounded border border-heritage-gold/30 bg-near-black px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-heritage-gold/50"
          />
        </div>

        {/* Employee filter — partners/admins only */}
        {isPartnerOrAdmin && (
          <Select value={employeeId} onValueChange={(v) => setEmployeeId(v ?? "all")}>
            <SelectTrigger className="w-48 border-heritage-gold/30 bg-near-black text-white">
              <SelectValue placeholder={t("hr.filterAllEmployees")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("hr.filterAllEmployees")}</SelectItem>
              {employees.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {lang === "ar" ? e.nameAr : e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Billable filter */}
        <Select value={billableFilter} onValueChange={(v) => setBillableFilter(v ?? "all")}>
          <SelectTrigger className="w-44 border-heritage-gold/30 bg-near-black text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("hr.filterAll")}</SelectItem>
            <SelectItem value="billable">{t("hr.filterBillable")}</SelectItem>
            <SelectItem value="nonBillable">{t("hr.filterNonBillable")}</SelectItem>
          </SelectContent>
        </Select>

        <Button
          size="sm"
          className="bg-heritage-gold text-near-black hover:bg-heritage-gold/90"
          onClick={fetchReport}
          disabled={fetching}
        >
          {fetching ? t("common.loading") : t("common.filter")}
        </Button>
      </div>

      {/* ── Summary cards ────────────────────────────────────────────── */}
      {totals && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            label={t("hr.totalHours")}
            value={`${totals.totalHours}h`}
            icon={Clock}
          />
          <StatCard
            label={t("hr.billableHours")}
            value={`${totals.billableHours}h`}
            icon={TrendingUp}
            gold
          />
          <StatCard
            label={t("hr.nonBillableHours")}
            value={`${totals.nonBillableHours}h`}
            icon={Users}
          />
          <StatCard
            label={t("hr.billableRatio")}
            value={`${totals.billableRatio}%`}
            icon={BarChart2}
            gold
          />
        </div>
      )}

      {/* ── Bar chart ────────────────────────────────────────────────── */}
      {rows.length > 0 && (
        <div className="rounded-lg border border-heritage-gold/20 bg-[#252525] p-4">
          <p className="mb-4 text-sm font-medium text-gray-300">{t("hr.hoursChart")}</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis
                dataKey="name"
                tick={{ fill: "#ccc", fontSize: 12 }}
                axisLine={{ stroke: "#555" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#ccc", fontSize: 12 }}
                axisLine={{ stroke: "#555" }}
                tickLine={false}
                unit="h"
              />
              <Tooltip
                contentStyle={{ background: "#1A1A1A", border: "1px solid #B8963E44", borderRadius: 6 }}
                labelStyle={{ color: "#fff" }}
                itemStyle={{ color: "#ccc" }}
              />
              <Legend wrapperStyle={{ color: "#ccc", fontSize: 13 }} />
              <Bar dataKey={t("hr.billableHours")} stackId="a" fill="#B8963E" radius={[0, 0, 0, 0]} />
              <Bar dataKey={t("hr.nonBillableHours")} stackId="a" fill="#3D3D3D" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Employee table ───────────────────────────────────────────── */}
      <div className="rounded-lg border border-heritage-gold/20 bg-[#252525] overflow-x-auto">
        {rows.length === 0 && !fetching ? (
          <p className="p-8 text-center text-gray-500">{t("hr.noData")}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-heritage-gold/20 hover:bg-transparent">
                {(
                  [
                    ["name", t("hr.employee")],
                    ["role", t("hr.role")],
                    ["totalHours", t("hr.totalHours")],
                    ["billableHours", t("hr.billableHours")],
                    ["nonBillableHours", t("hr.nonBillableHours")],
                    ["billableRatio", t("hr.billableRatio")],
                    ["casesCount", t("hr.cases")],
                  ] as [SortableKey, string][]
                ).map(([key, label]) => (
                  <TableHead
                    key={key}
                    className="cursor-pointer select-none text-gray-400 hover:text-white"
                    onClick={() => toggleSort(key)}
                  >
                    {label} <SortIcon col={key} />
                  </TableHead>
                ))}
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((row) => (
                <React.Fragment key={row.userId}>
                  <TableRow
                    className="cursor-pointer border-heritage-gold/10 hover:bg-heritage-gold/5"
                    onClick={() =>
                      setExpandedRow(expandedRow === row.userId ? null : row.userId)
                    }
                  >
                    <TableCell className="font-medium text-white">
                      {lang === "ar" ? row.nameAr : row.name}
                    </TableCell>
                    <TableCell className="text-gray-400 text-sm">
                      {roleLabel(row.role, t)}
                    </TableCell>
                    <TableCell className="text-white font-semibold">
                      {row.totalHours}h
                    </TableCell>
                    <TableCell className="text-heritage-gold">
                      {row.billableHours}h
                    </TableCell>
                    <TableCell className="text-gray-400">
                      {row.nonBillableHours}h
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-sm font-medium ${
                          row.billableRatio >= 70
                            ? "text-green-400"
                            : row.billableRatio >= 40
                              ? "text-yellow-400"
                              : "text-red-400"
                        }`}
                      >
                        {row.billableRatio}%
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-400">{row.casesCount}</TableCell>
                    <TableCell className="text-gray-500">
                      {expandedRow === row.userId ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </TableCell>
                  </TableRow>

                  {/* Expanded: individual work logs */}
                  {expandedRow === row.userId && (
                    <TableRow className="border-heritage-gold/10">
                      <TableCell colSpan={8} className="bg-[#1e1e1e] p-0">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-heritage-gold/10 text-gray-500">
                                <th className="px-4 py-2 text-start">{t("hr.date")}</th>
                                <th className="px-4 py-2 text-start">{t("hr.client")}</th>
                                <th className="px-4 py-2 text-start">{t("hr.case")}</th>
                                <th className="px-4 py-2 text-start">{t("hr.workType")}</th>
                                <th className="px-4 py-2 text-start">{t("hr.hours")}</th>
                                <th className="px-4 py-2 text-start">{t("hr.billable")}</th>
                                <th className="px-4 py-2 text-start">{t("hr.notes")}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {row.logs.map((log) => (
                                <tr
                                  key={log.id}
                                  className="border-b border-white/5 hover:bg-white/5"
                                >
                                  <td className="px-4 py-2 text-gray-400">
                                    {new Date(log.date).toLocaleDateString(
                                      lang === "ar" ? "ar-SA" : "en-GB",
                                    )}
                                  </td>
                                  <td className="px-4 py-2 text-gray-300">{log.client}</td>
                                  <td className="px-4 py-2 text-gray-400 text-xs">
                                    {log.caseNumber}
                                  </td>
                                  <td className="px-4 py-2 text-gray-400">
                                    {lang === "ar" ? log.workTypeAr : log.workType}
                                  </td>
                                  <td className="px-4 py-2 font-medium text-white">
                                    {log.hours}h
                                  </td>
                                  <td className="px-4 py-2">
                                    {log.isBillable ? (
                                      <span className="rounded-full bg-heritage-gold/20 px-2 py-0.5 text-xs text-heritage-gold">
                                        {t("hr.filterBillable")}
                                      </span>
                                    ) : (
                                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-gray-400">
                                        {t("hr.filterNonBillable")}
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-4 py-2 text-gray-500 text-xs max-w-40 truncate">
                                    {log.notes}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
