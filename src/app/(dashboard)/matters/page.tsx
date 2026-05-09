"use client";

import * as React from "react";
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

type MatterRow = {
  id: string;
  matterNumber: string;
  title: string;
  titleAr: string;
  status: string;
  client: { id: string; name: string; nameAr: string };
  department: { id: string; name: string; nameAr: string };
  assignedTo: { id: string; name: string; nameAr: string };
  approvedBy: { id: string; name: string; nameAr: string } | null;
  approvedAt: string | null;
  createdAt: string;
};

type Client = { id: string; name: string; nameAr: string };
type Department = { id: string; name: string; nameAr: string };

const STATUS_BADGE: Record<string, string> = {
  PENDING_APPROVAL: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  ON_HOLD: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  COMPLETED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export default function MattersPage() {
  const { t, lang } = useI18n();
  const { user } = useAuth();

  const [matters, setMatters] = React.useState<MatterRow[]>([]);
  const [clients, setClients] = React.useState<Client[]>([]);
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [loading, setLoading] = React.useState(true);

  const [addOpen, setAddOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({
    title: "",
    titleAr: "",
    clientId: "",
    departmentId: "",
    description: "",
  });

  const canApprove = (m: MatterRow) => {
    if (!user) return false;
    if (user.role === "PARTNER") return true;
    if (user.role === "MANAGER" && user.departmentId === m.department.id) return true;
    return false;
  };

  const canCreate = user && ["PARTNER", "ADMIN", "MANAGER", "EMPLOYEE"].includes(user.role);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      const res = await fetch(`/api/matters?${params}`);
      const data = await res.json() as { matters: MatterRow[] };
      setMatters(data.matters ?? []);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  React.useEffect(() => { void load(); }, [load]);

  React.useEffect(() => {
    void fetch("/api/clients").then((r) => r.json()).then((d: { clients: Client[] }) => setClients(d.clients ?? []));
    void fetch("/api/departments").then((r) => r.json()).then((d: { departments: Department[] }) => setDepartments(d.departments ?? []));
  }, []);

  async function handleApprove(id: string) {
    const res = await fetch(`/api/matters/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve" }),
    });
    if (res.ok) {
      toast.success(t("matter.approved"));
      void load();
    } else {
      toast.error("Failed to approve");
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.clientId || !form.departmentId) {
      toast.error("Client and department are required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/matters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success(t("matter.addMatter"));
        setAddOpen(false);
        setForm({ title: "", titleAr: "", clientId: "", departmentId: "", description: "" });
        void load();
      } else {
        const d = await res.json() as { error?: string };
        toast.error(d.error ?? "Failed to create");
      }
    } finally {
      setSaving(false);
    }
  }

  const filtered = matters.filter((m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      m.matterNumber.toLowerCase().includes(q) ||
      m.title.toLowerCase().includes(q) ||
      m.titleAr.includes(q) ||
      m.client.name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t("matter.title")}</h1>
        {canCreate && (
          <Button
            size="sm"
            className="bg-heritage-gold text-near-black hover:bg-heritage-gold/90"
            onClick={() => setAddOpen(true)}
          >
            + {t("matter.addMatter")}
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Input
          className="h-8 w-48 text-sm"
          placeholder={t("search") ?? "Search"}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 w-40 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            {["PENDING_APPROVAL", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"].map((s) => (
              <SelectItem key={s} value={s}>
                {t(`matter.status.${s}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("matter.matterNumber")}</TableHead>
              <TableHead>{lang === "ar" ? "العنوان" : "Title"}</TableHead>
              <TableHead>{lang === "ar" ? "العميل" : "Client"}</TableHead>
              <TableHead>{lang === "ar" ? "القسم" : "Department"}</TableHead>
              <TableHead>{lang === "ar" ? "الحالة" : "Status"}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  {lang === "ar" ? "جاري التحميل..." : "Loading..."}
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  {lang === "ar" ? "لا توجد مسائل" : "No matters found"}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-mono text-sm">{m.matterNumber}</TableCell>
                  <TableCell>{lang === "ar" && m.titleAr ? m.titleAr : m.title}</TableCell>
                  <TableCell>{lang === "ar" ? m.client.nameAr : m.client.name}</TableCell>
                  <TableCell>{lang === "ar" ? m.department.nameAr : m.department.name}</TableCell>
                  <TableCell>
                    <Badge className={STATUS_BADGE[m.status] ?? ""}>
                      {t(`matter.status.${m.status}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {m.status === "PENDING_APPROVAL" && canApprove(m) && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 border-heritage-gold/50 text-heritage-gold hover:bg-heritage-gold/10"
                        onClick={() => void handleApprove(m.id)}
                      >
                        {t("matter.approve")}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Matter Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("matter.addMatter")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => void handleAdd(e)} className="space-y-3">
            <div className="space-y-1.5">
              <Label>{lang === "ar" ? "العنوان (إنجليزي)" : "Title (English)"}</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>{lang === "ar" ? "العنوان (عربي)" : "Title (Arabic)"}</Label>
              <Input
                dir="rtl"
                value={form.titleAr}
                onChange={(e) => setForm((f) => ({ ...f, titleAr: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{lang === "ar" ? "العميل" : "Client"}</Label>
              <Select
                value={form.clientId}
                onValueChange={(v) => setForm((f) => ({ ...f, clientId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={lang === "ar" ? "اختر العميل" : "Select client"} />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {lang === "ar" ? c.nameAr : c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{lang === "ar" ? "القسم" : "Department"}</Label>
              <Select
                value={form.departmentId}
                onValueChange={(v) => setForm((f) => ({ ...f, departmentId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={lang === "ar" ? "اختر القسم" : "Select department"} />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {lang === "ar" ? d.nameAr : d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                {lang === "ar" ? "إلغاء" : "Cancel"}
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-heritage-gold text-near-black hover:bg-heritage-gold/90"
              >
                {saving ? "..." : lang === "ar" ? "حفظ" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
