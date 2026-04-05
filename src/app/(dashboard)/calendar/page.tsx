"use client";

import { useI18n } from "@/contexts/language-context";

export default function CalendarPage() {
  const { t } = useI18n();
  return (
    <div className="space-y-4">
      <div className="rounded-md border border-heritage-gold/30 bg-amber-950/30 p-4 text-sm">
        {t("calendar.outlookBanner")}
      </div>
      <p className="text-muted-foreground">{t("calendar.title")}</p>
    </div>
  );
}
