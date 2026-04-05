"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/contexts/language-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type ClientRow = {
  id: string;
  name: string;
  nameAr: string;
  email: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
  _count: { cases: number };
};

function ClientsInner() {
  const { lang, t } = useI18n();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("search") ?? "";
  const [clients, setClients] = React.useState<ClientRow[]>([]);
  const [q, setQ] = React.useState(initialQ);
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({
    name: "",
    nameAr: "",
    email: "",
    phone: "",
  });

  const load = React.useCallback(() => {
    const p = new URLSearchParams();
    if (q) p.set("search", q);
    void fetch(`/api/clients?${p.toString()}`)
      .then((r) => r.json())
      .then((d) => setClients(d.clients ?? []));
  }, [q]);

  React.useEffect(() => {
    load();
  }, [load]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error ?? "Error");
      return;
    }
    toast.success("OK");
    setOpen(false);
    setForm({ name: "", nameAr: "", email: "", phone: "" });
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("common.search")}
          className="max-w-sm"
        />
        <Dialog open={open} onOpenChange={setOpen}>
          <Button
            type="button"
            className="bg-heritage-gold text-near-black hover:bg-heritage-gold/90"
            onClick={() => setOpen(true)}
          >
            <Plus className="me-1 h-4 w-4" />
            {t("common.add")}
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("clients.title")}</DialogTitle>
            </DialogHeader>
            <form onSubmit={onCreate} className="space-y-3">
              <div>
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <Label>Name AR</Label>
                <Input
                  value={form.nameAr}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, nameAr: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                />
              </div>
              <Button type="submit">{t("common.save")}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="overflow-x-auto rounded-md border border-heritage-gold/20">
        <Table dir={lang === "ar" ? "rtl" : "ltr"}>
          <TableHeader>
            <TableRow>
              <TableHead className="text-start">Name</TableHead>
              <TableHead className="text-start">Phone</TableHead>
              <TableHead className="text-start">Email</TableHead>
              <TableHead className="text-start"># Cases</TableHead>
              <TableHead className="text-start">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <Link
                    href={`/clients/${c.id}`}
                    className="text-heritage-gold hover:underline"
                  >
                    {lang === "ar" ? c.nameAr : c.name}
                  </Link>
                </TableCell>
                <TableCell>{c.phone}</TableCell>
                <TableCell>{c.email}</TableCell>
                <TableCell>{c._count.cases}</TableCell>
                <TableCell>
                  <Badge variant={c.isActive ? "default" : "secondary"}>
                    {c.isActive ? t("status.active") : t("status.inactive")}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default function ClientsPage() {
  return (
    <Suspense fallback={<div className="p-4">{/* loading */}</div>}>
      <ClientsInner />
    </Suspense>
  );
}
