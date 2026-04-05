"use client";

import * as React from "react";
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

export default function ConflictCheckPage() {
  const [term, setTerm] = React.useState("");
  const [rows, setRows] = React.useState<
    { type: string; name: string; status: string }[]
  >([]);

  async function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/conflict-check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ searchTerm: term }),
    });
    const data = await res.json();
    setRows(data.results ?? []);
  }

  return (
    <div className="space-y-4">
      <form onSubmit={onSearch} className="flex gap-2">
        <Input value={term} onChange={(e) => setTerm(e.target.value)} />
        <Button type="submit">Search</Button>
      </form>
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
    </div>
  );
}
