"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select-radix";
import { useI18n } from "@/contexts/language-context";
import { useAuth } from "@/contexts/auth-provider";
import { hasPermission } from "@/lib/permissions";

const STATUS_OPTIONS = ["TODO", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;
const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

type TaskRow = {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  case: { caseNumber: string; client: { name: string } } | null;
  assignedTo: { name: string };
};

type SelectUser = { id: string; name: string };
type SelectCase = { id: string; caseNumber: string; title: string };

export default function TasksPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [view, setView] = React.useState<"table" | "kanban">("table");
  const [tasks, setTasks] = React.useState<TaskRow[]>([]);
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");
  const [users, setUsers] = React.useState<SelectUser[]>([]);
  const [cases, setCases] = React.useState<SelectCase[]>([]);

  const emptyForm = {
    title: "",
    titleAr: "",
    assignedToId: "",
    caseId: "",
    status: "TODO",
    priority: "MEDIUM",
    dueDate: "",
  };
  const [form, setForm] = React.useState(emptyForm);

  async function loadTasks() {
    const d = await fetch("/api/tasks").then((r) => r.json());
    setTasks(d.tasks ?? []);
  }

  React.useEffect(() => {
    void loadTasks();
    void fetch("/api/users").then((r) => r.json()).then((d) => setUsers(d.users ?? []));
    void fetch("/api/cases").then((r) => r.json()).then((d) => setCases(d.cases ?? []));
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.assignedToId) {
      setError(t("tasks.addError"));
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const body = {
        ...form,
        caseId: form.caseId || null,
        dueDate: form.dueDate || null,
      };
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t("tasks.addError"));
        return;
      }
      toast.success(t("tasks.addSuccess"));
      setOpen(false);
      setForm(emptyForm);
      await loadTasks();
    } catch {
      setError(t("tasks.addError"));
    } finally {
      setSubmitting(false);
    }
  }

  const canCreate = user ? hasPermission(user.role, "createClientCase") : false;
  const cols = ["TODO", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          variant={view === "table" ? "default" : "outline"}
          onClick={() => setView("table")}
        >
          Table
        </Button>
        <Button
          variant={view === "kanban" ? "default" : "outline"}
          onClick={() => setView("kanban")}
        >
          Kanban
        </Button>
        {canCreate && (
          <Button
            className="ms-auto bg-heritage-gold text-white hover:bg-heritage-gold/90"
            onClick={() => { setError(""); setForm(emptyForm); setOpen(true); }}
          >
            {t("tasks.addTask")}
          </Button>
        )}
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
            <div
              key={col}
              className="rounded-md border border-heritage-gold/20 p-2"
            >
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("tasks.addTask")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>{t("tasks.taskTitle")} *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label>{t("tasks.taskTitleAr")}</Label>
                <Input
                  dir="rtl"
                  value={form.titleAr}
                  onChange={(e) => setForm((f) => ({ ...f, titleAr: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label>{t("tasks.assignedTo")} *</Label>
              <Select
                value={form.assignedToId}
                onValueChange={(v) => setForm((f) => ({ ...f, assignedToId: v ?? "" }))}
              >
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>{t("tasks.case")}</Label>
              <Select
                value={form.caseId}
                onValueChange={(v) => setForm((f) => ({ ...f, caseId: v ?? "" }))}
              >
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  {cases.map((c) => (
                    <SelectItem key={c.id} value={c.id} textValue={`${c.caseNumber} — ${c.title}`}>
                      <bdi dir="ltr">{c.caseNumber}</bdi>
                      {" — "}
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>{t("cases.status")}</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm((f) => ({ ...f, status: v ?? "TODO" }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>{t("cases.priority")}</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) => setForm((f) => ({ ...f, priority: v ?? "MEDIUM" }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label>{t("tasks.dueDate")}</Label>
              <Input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-heritage-gold text-white hover:bg-heritage-gold/90"
              >
                {submitting ? t("common.loading") : t("common.save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
