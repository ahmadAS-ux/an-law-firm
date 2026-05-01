"use client";

import * as React from "react";
import { toast } from "sonner";
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
import { useI18n } from "@/contexts/language-context";

type WorkType = {
  id: string;
  name: string;
  nameAr: string;
  isActive: boolean;
  _count: { workLogs: number };
};

export default function ServicesPage() {
  const { t } = useI18n();
  const [types, setTypes] = React.useState<WorkType[]>([]);
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");

  const emptyForm = { name: "", nameAr: "", isActive: true };
  const [form, setForm] = React.useState(emptyForm);

  async function loadTypes() {
    const d = await fetch("/api/work-types").then((r) => r.json());
    setTypes(d.workTypes ?? []);
  }

  React.useEffect(() => {
    void loadTypes();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) {
      setError(t("services.addError"));
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/work-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t("services.addError"));
        return;
      }
      toast.success(t("services.addSuccess"));
      setOpen(false);
      setForm(emptyForm);
      await loadTypes();
    } catch {
      setError(t("services.addError"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <RoleGuard roles={["ADMIN"]}>
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button
            className="bg-heritage-gold text-white hover:bg-heritage-gold/90"
            onClick={() => { setError(""); setForm(emptyForm); setOpen(true); }}
          >
            {t("services.addWorkType")}
          </Button>
        </div>

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
                  <Badge>
                    {w.isActive ? t("status.active") : t("status.inactive")}
                  </Badge>
                </TableCell>
                <TableCell>{w._count.workLogs}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("services.addWorkType")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label>{t("services.nameEn")} *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1">
              <Label>{t("services.nameAr")}</Label>
              <Input
                dir="rtl"
                value={form.nameAr}
                onChange={(e) => setForm((f) => ({ ...f, nameAr: e.target.value }))}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="isActive"
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="h-4 w-4 accent-heritage-gold"
              />
              <Label htmlFor="isActive">{t("services.isActive")}</Label>
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
    </RoleGuard>
  );
}
