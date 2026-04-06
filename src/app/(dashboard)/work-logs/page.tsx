"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/contexts/language-context";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export default function WorkLogsEntryPage() {
  const { t, lang } = useI18n();
  const [clients, setClients] = React.useState<
    { id: string; name: string; nameAr: string }[]
  >([]);
  const [cases, setCases] = React.useState<
    { id: string; caseNumber: string; clientId: string; title: string; titleAr: string }[]
  >([]);
  const [types, setTypes] = React.useState<
    { id: string; name: string; nameAr: string }[]
  >([]);
  const [clientId, setClientId] = React.useState("");
  const [caseId, setCaseId] = React.useState("");
  const [workTypeId, setWorkTypeId] = React.useState("");
  const [hours, setHours] = React.useState("1");
  const [billable, setBillable] = React.useState(true);
  const [notes, setNotes] = React.useState("");
  const [date, setDate] = React.useState(
    () => new Date().toISOString().slice(0, 10),
  );

  React.useEffect(() => {
    void fetch("/api/clients")
      .then((r) => r.json())
      .then((d) => setClients(d.clients ?? []));
    void fetch("/api/cases")
      .then((r) => r.json())
      .then((d) => setCases(d.cases ?? []));
    void fetch("/api/work-types")
      .then((r) => r.json())
      .then((d) => setTypes(d.workTypes ?? []));
  }, []);

  const filteredCases = React.useMemo(
    () => cases.filter((c) => !clientId || c.clientId === clientId),
    [cases, clientId],
  );

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/work-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId,
        caseId,
        workTypeId,
        hours: parseFloat(hours),
        isBillable: billable,
        date,
        notes,
        notesAr: notes,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error ?? t("common.noData"));
      return;
    }
    toast.success(t("common.save"));
    setHours("1");
    setNotes("");
    setDate(new Date().toISOString().slice(0, 10));
    setBillable(true);
  }

  return (
    <form onSubmit={onSave} className="mx-auto max-w-lg space-y-5">
      {/* Client */}
      <div className="space-y-1.5">
        <Label>{t("workLog.client")}</Label>
        <Select
          value={clientId}
          onValueChange={(v) => {
            setClientId(v ?? "");
            setCaseId("");
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="—" />
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

      {/* Case */}
      <div className="space-y-1.5">
        <Label>{t("workLog.case")}</Label>
        <Select value={caseId} onValueChange={(v) => setCaseId(v ?? "")}>
          <SelectTrigger>
            <SelectValue placeholder="—" />
          </SelectTrigger>
          <SelectContent>
            {filteredCases.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                <span dir="ltr">{c.caseNumber}</span>
                {" — "}
                {lang === "ar" ? c.titleAr : c.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Work type */}
      <div className="space-y-1.5">
        <Label>{t("workLog.workType")}</Label>
        <Select
          value={workTypeId}
          onValueChange={(v) => setWorkTypeId(v ?? "")}
        >
          <SelectTrigger>
            <SelectValue placeholder="—" />
          </SelectTrigger>
          <SelectContent>
            {types.map((w) => (
              <SelectItem key={w.id} value={w.id}>
                {lang === "ar" ? w.nameAr : w.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Hours + Date side by side */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>{t("workLog.hours")}</Label>
          <Input
            type="number"
            step="0.25"
            min="0.25"
            max="24"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label>{t("workLog.date")}</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
      </div>

      {/* Billable toggle — two-button segment */}
      <div className="space-y-1.5">
        <Label>{t("workLog.billable")}</Label>
        <div className="flex overflow-hidden rounded-md border border-heritage-gold/30">
          <button
            type="button"
            onClick={() => setBillable(true)}
            className={cn(
              "flex-1 px-4 py-2 text-sm font-medium transition-colors",
              billable
                ? "bg-heritage-gold text-near-black"
                : "text-gray-400 hover:bg-white/5 hover:text-white",
            )}
          >
            {t("workLog.billable")}
          </button>
          <button
            type="button"
            onClick={() => setBillable(false)}
            className={cn(
              "flex-1 border-s border-heritage-gold/30 px-4 py-2 text-sm font-medium transition-colors",
              !billable
                ? "bg-heritage-gold text-near-black"
                : "text-gray-400 hover:bg-white/5 hover:text-white",
            )}
          >
            {t("workLog.nonBillable")}
          </button>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <Label>{t("workLog.notes")}</Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="resize-none"
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-heritage-gold text-near-black hover:bg-heritage-gold/90"
      >
        {t("common.save")}
      </Button>
    </form>
  );
}
