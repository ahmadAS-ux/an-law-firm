"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/contexts/language-context";
import { BidiStr } from "@/components/bidi";

export default function NotificationsPage() {
  const { lang } = useI18n();
  const [items, setItems] = React.useState<
    { id: string; title: string; titleAr: string; isRead: boolean; link: string | null }[]
  >([]);

  React.useEffect(() => {
    void fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []));
  }, []);

  async function markAll() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });
    void fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []));
  }

  return (
    <div className="space-y-4">
      <Button type="button" variant="outline" onClick={() => void markAll()}>
        Mark all read
      </Button>
      <ul className="space-y-2">
        {items.map((n) => (
          <li key={n.id} className={n.isRead ? "opacity-60" : ""}>
            {n.link ? (
              <Link href={n.link} className="text-heritage-gold">
                {lang === "ar" ? <BidiStr text={n.titleAr} /> : n.title}
              </Link>
            ) : (
              <span>{lang === "ar" ? <BidiStr text={n.titleAr} /> : n.title}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
