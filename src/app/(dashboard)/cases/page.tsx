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

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

const STATUS_OPTIONS = ["OPEN", "ACTIVE", "CLOSED"] as const;
const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

type CaseRow = {
  id: string;
  caseNumber: string;
  title: string;
  status: string;
  priority: string;
  client: { name: string };
  assignedTo: { name: string };
  createdAt: string;
};

type SelectUser = { id: string; name: string };
type SelectClient = { id: string; name: string };

export default function CasesPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [cases, setCases] = React.useState<CaseRow[]>([]);
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");
  const [clients, setClients] = React.useState<SelectClient[]>([]);
  const [users, setUsers] = React.useState<SelectUser[]>([]);

  const emptyForm = {
    title: "",
    titleAr: "",
    clientId: "",
    assignedToId: "",
    status: "OPEN",
    priority: "MEDIUM",
    openDate: new Date().toISOString().slice(0, 10),
  };
  const [form, setForm] = React.useState(emptyForm);

  async function loadCases() {
    const d = await fetch("/api/cases").then((r) => r.json());
    setCases(d.cases ?? []);
  }

  React.useEffect(() => {
    void loadCases();
    void fetch("/api/clients").then((r) => r.json()).then((d) => setClients(d.clients ?? []));
    void fetch("/api/users").then((r) => r.json()).then((d) => setUsers(d.users ?? []));
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.clientId || !form.assignedToId) {
      setError(t("cases.addError"));
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t("cases.addError"));
        return;
      }
      toast.success(t("cases.addSuccess"));
      setOpen(false);
      setForm(emptyForm);
      await loadCases();
    } catch {
      setError(t("cases.addError"));
    } finally {
      setSubmitting(false);
    }
  }

  // TODO: Confirm with Ahmad — UI audit suggests Employee should not see Add Case button despite current permission matrix (createClientCase: true for all roles)
  const canCreate = user ? hasPermission(user.role, "createClientCase") : false;

  return (
    <div className="space-y-4">
      {canCreate && (
        <div className="flex justify-end">
          <Button
            className="bg-heritage-gold text-white hover:bg-heritage-gold/90"
            onClick={() => { setError(""); setForm(emptyForm); setOpen(true); }}
          >
            {t("cases.addCase")}
          </Button>
        </div>
      )}

      <div className="overflow-x-auto rounded-md border border-heritage-gold/20">
        <Table>
          <colgroup>
            <col className="w-36" />
            <col className="w-auto" />
            <col className="w-40" />
            <col className="w-28" />
            <col className="w-28" />
            <col className="w-36" />
            <col className="w-32" />
          </colgroup>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>{t("cases.title")}</TableHead>
              <TableHead>{t("workLog.client")}</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Assigned</TableHead>
              <TableHead>{t("cases.dateOpened")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cases.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <Link className="text-heritage-gold" href={`/cases/${c.id}`}>
                    {c.caseNumber}
                  </Link>
                </TableCell>
                <TableCell>{c.title}</TableCell>
                <TableCell>{c.client.name}</TableCell>
                <TableCell>
                  <Badge>{c.status}</Badge>
                </TableCell>
                <TableCell>{c.priority}</TableCell>
                <TableCell>{c.assignedTo.name}</TableCell>
                <TableCell>{formatDate(c.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("cases.addCase")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>{t("cases.caseTitle")} *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label>{t("cases.caseTitleAr")} *</Label>
                <Input
                  dir="rtl"
                  value={form.titleAr}
                  onChange={(e) => setForm((f) => ({ ...f, titleAr: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label>{t("cases.client")} *</Label>
              <Select
                value={form.clientId}
                onValueChange={(v) => setForm((f) => ({ ...f, clientId: v ?? "" }))}
              >
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>{t("cases.assignedTo")} *</Label>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>{t("cases.status")}</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm((f) => ({ ...f, status: v ?? "OPEN" }))}
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
              <Label>{t("cases.openDate")}</Label>
              <Input
                type="date"
                value={form.openDate}
                onChange={(e) => setForm((f) => ({ ...f, openDate: e.target.value }))}
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
