"use client";

import * as React from "react";
import { ar } from "@/i18n/ar";
import { en } from "@/i18n/en";

export type Lang = "ar" | "en";

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  dir: "rtl" | "ltr";
};

const LanguageContext = React.createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<Lang>("ar");

  React.useEffect(() => {
    const stored = localStorage.getItem("an-lang") as Lang | null;
    if (stored === "en" || stored === "ar") setLangState(stored);
  }, []);

  const setLang = React.useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("an-lang", l);
    if (typeof document !== "undefined") {
      document.documentElement.lang = l === "ar" ? "ar" : "en";
      document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
    }
  }, []);

  React.useEffect(() => {
    document.documentElement.lang = lang === "ar" ? "ar" : "en";
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const dict = lang === "ar" ? ar : en;

  const t = React.useCallback(
    (key: string) => dict[key] ?? key,
    [dict],
  );

  const dir: "rtl" | "ltr" = lang === "ar" ? "rtl" : "ltr";

  const value = React.useMemo(
    () => ({ lang, setLang, t, dir }),
    [lang, setLang, t, dir],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useI18n(): Ctx {
  const ctx = React.useContext(LanguageContext);
  if (!ctx) throw new Error("useI18n must be within LanguageProvider");
  return ctx;
}
