"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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

export default function WorkLogsEntryPage() {
  const { t } = useI18n();
  const [clients, setClients] = React.useState<{ id: string; name: string }[]>(
    [],
  );
  const [cases, setCases] = React.useState<
    { id: string; caseNumber: string; clientId: string; title: string }[]
  >([]);
  const [types, setTypes] = React.useState<{ id: string; name: string }[]>([]);
  const [clientId, setClientId] = React.useState("");
  const [caseId, setCaseId] = React.useState("");
  const [workTypeId, setWorkTypeId] = React.useState("");
  const [hours, setHours] = React.useState("1");
  const [billable, setBillable] = React.useState(true);
  const [notesOpen, setNotesOpen] = React.useState(false);
  const [notes, setNotes] = React.useState("");

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
        notes,
      }),
    });
    if (!res.ok) {
      toast.error("Failed");
      return;
    }
    toast.success("Saved");
    setHours("1");
    setNotes("");
  }

  return (
    <form onSubmit={onSave} className="mx-auto max-w-lg space-y-4">
      <div>
        <Label>Client</Label>
        <Select value={clientId} onValueChange={(v) => { setClientId(v ?? ""); setCaseId(""); }}>
          <SelectTrigger>
            <SelectValue placeholder="—" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Case</Label>
        <Select value={caseId} onValueChange={(v) => setCaseId(v ?? "")}>
          <SelectTrigger>
            <SelectValue placeholder="—" />
          </SelectTrigger>
          <SelectContent>
            {filteredCases.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.caseNumber}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Work type</Label>
        <Select value={workTypeId} onValueChange={(v) => setWorkTypeId(v ?? "")}>
          <SelectTrigger>
            <SelectValue placeholder="—" />
          </SelectTrigger>
          <SelectContent>
            {types.map((w) => (
              <SelectItem key={w.id} value={w.id}>
                {w.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Hours</Label>
        <Input
          type="number"
          step="0.25"
          min="0"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-2">
        <Switch checked={billable} onCheckedChange={setBillable} id="bill" />
        <Label htmlFor="bill">Billable</Label>
      </div>
      <Button type="button" variant="link" onClick={() => setNotesOpen(!notesOpen)}>
        Notes
      </Button>
      {notesOpen && (
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
      )}
      <Button
        type="submit"
        className="w-full bg-heritage-gold text-near-black hover:bg-heritage-gold/90"
      >
        {t("common.save")}
      </Button>
      <p className="text-xs text-muted-foreground">
        {/* TODO: Add Outlook calendar event creation here via Microsoft Graph API */}
      </p>
    </form>
  );
}
