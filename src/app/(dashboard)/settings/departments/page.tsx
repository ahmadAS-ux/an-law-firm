"use client";

import * as React from "react";
import { Building2, Plus, Pencil, Trash2 } from "lucide-react";
import { useI18n } from "@/contexts/language-context";
import { useAuth } from "@/contexts/auth-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface DeptUser { id: string; name: string; nameAr: string; role: string }
interface Department {
  id: string;
  name: string;
  nameAr: string;
  managerId: string | null;
  manager: { id: string; name: string; nameAr: string } | null;
  users: DeptUser[];
}

export default function DepartmentsPage() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const isPartner = user?.role === "PARTNER";

  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showAdd, setShowAdd] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({ name: "", nameAr: "" });
  const [submitting, setSubmitting] = React.useState(false);

  async function load() {
    const res = await fetch("/api/departments");
    const data = await res.json();
    setDepartments(data.departments ?? []);
    setLoading(false);
  }

  React.useEffect(() => { load(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await fetch("/api/departments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", nameAr: "" });
    setShowAdd(false);
    setSubmitting(false);
    load();
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editId) return;
    setSubmitting(true);
    await fetch(`/api/departments/${editId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setEditId(null);
    setForm({ name: "", nameAr: "" });
    setSubmitting(false);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm(t("settings.departments.deleteConfirm"))) return;
    await fetch(`/api/departments/${id}`, { method: "DELETE" });
    load();
  }

  function startEdit(dept: Department) {
    setEditId(dept.id);
    setForm({ name: dept.name, nameAr: dept.nameAr });
    setShowAdd(false);
  }

  if (!isPartner && user?.role !== "ADMIN") {
    return <p className="text-sm text-muted-foreground">{t("common.noData")}</p>;
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">{t("settings.departments.title")}</h2>
        {isPartner && (
          <Button
            size="sm"
            className="bg-heritage-gold text-white hover:bg-heritage-gold/90 gap-1"
            onClick={() => { setShowAdd(true); setEditId(null); setForm({ name: "", nameAr: "" }); }}
          >
            <Plus className="w-4 h-4" />
            {t("settings.departments.add")}
          </Button>
        )}
      </div>

      {(showAdd || editId) && (
        <form
          onSubmit={editId ? handleEdit : handleAdd}
          className="rounded-md border border-heritage-gold/30 p-4 space-y-3 bg-muted/20"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">{t("settings.departments.name")}</label>
              <Input
                dir="ltr"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
                placeholder="Corporate"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">{t("settings.departments.nameAr")}</label>
              <Input
                dir="rtl"
                value={form.nameAr}
                onChange={(e) => setForm((f) => ({ ...f, nameAr: e.target.value }))}
                required
                placeholder="الشركات"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" type="submit" disabled={submitting} className="bg-heritage-gold text-white hover:bg-heritage-gold/90">
              {t("common.save")}
            </Button>
            <Button size="sm" variant="outline" type="button" onClick={() => { setShowAdd(false); setEditId(null); }}>
              {t("common.cancel")}
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      ) : departments.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("common.noData")}</p>
      ) : (
        <div className="space-y-3">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="rounded-md border border-border p-4 space-y-2 bg-card"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-heritage-gold shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">
                      <bdi dir="ltr">{dept.name}</bdi>
                      <span className="text-muted-foreground mx-2">·</span>
                      <span dir="rtl">{dept.nameAr}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("settings.departments.manager")}:{" "}
                      {dept.manager
                        ? (lang === "ar" ? dept.manager.nameAr : dept.manager.name)
                        : t("settings.departments.noManager")}
                    </p>
                  </div>
                </div>
                {isPartner && (
                  <div className="flex gap-1 shrink-0">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEdit(dept)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(dept.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>
              {dept.users.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {dept.users.slice(0, 8).map((u) => (
                    <Badge key={u.id} variant="secondary" className="text-[10px]">
                      {lang === "ar" ? u.nameAr : u.name}
                    </Badge>
                  ))}
                  {dept.users.length > 8 && (
                    <Badge variant="outline" className="text-[10px]">+{dept.users.length - 8}</Badge>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
