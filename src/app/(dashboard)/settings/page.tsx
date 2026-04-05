"use client";

import { useI18n } from "@/contexts/language-context";

export default function SettingsPage() {
  const { t } = useI18n();
  return (
    <p className="text-muted-foreground">{t("settings.title")}</p>
  );
}
