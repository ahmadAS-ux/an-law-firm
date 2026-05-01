"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
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
import { useI18n } from "@/contexts/language-context";

export default function ConflictCheckPage() {
  const { t } = useI18n();
  const [term, setTerm] = React.useState("");
  const [rows, setRows] = React.useState<
    { type: string; name: string; status: string }[]
  >([]);
  const [loading, setLoading] = React.useState(false);
  const [searched, setSearched] = React.useState(false);

  async function onSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!term.trim()) return;
    setRows([]);
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch("/api/conflict-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ searchTerm: term }),
      });
      const data = await res.json();
      setRows(data.results ?? []);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={onSearch} className="flex gap-2">
        <Input value={term} onChange={(e) => setTerm(e.target.value)} />
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="me-2 h-4 w-4 animate-spin" />
              {t("conflictCheck.searching")}
            </>
          ) : (
            t("common.search")
          )}
        </Button>
      </form>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-heritage-gold" />
        </div>
      )}

      {!loading && searched && rows.length === 0 && (
        <p className="py-6 text-center text-muted-foreground">
          {t("conflictCheck.noResults")}
        </p>
      )}

      {!loading && rows.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, i) => (
              <TableRow key={i}>
                <TableCell>{r.type}</TableCell>
                <TableCell className="text-heritage-gold">{r.name}</TableCell>
                <TableCell>{r.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
