"use client";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/contexts/language-context";

export function LanguageSwitcher({ compact }: { compact?: boolean }) {
  const { lang, setLang, t } = useI18n();
  const next = lang === "ar" ? "en" : "ar";
  return (
    <Button
      type="button"
      variant="outline"
      size={compact ? "sm" : "default"}
      className="border-heritage-gold/40 text-heritage-gold"
      onClick={() => setLang(next)}
    >
      {lang === "ar" ? t("language.en") : t("language.ar")}
    </Button>
  );
}
