"use client";

import * as React from "react";
import { useI18n } from "@/contexts/language-context";
import { RoleGuard } from "@/components/role-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-heritage-gold/20 overflow-hidden">
      <div className="bg-[#1A1A1A] px-4 py-2 border-b border-heritage-gold/50">
        <h2 className="font-semibold text-white">{title}</h2>
      </div>
      <div className="p-4 space-y-3 bg-card">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

export default function SettingsPage() {
  const { t, lang, setLang } = useI18n();
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV ?? "staging";
  const env =
    appEnv === "production"
      ? t("settings.envProduction")
      : t("settings.envStaging");

  return (
    <RoleGuard roles={["PARTNER", "ADMIN"]}>
      <div className="max-w-2xl space-y-6">
        {/* Section 1 — Firm Information */}
        <SectionCard title={t("settings.firmInfo")}>
          <InfoRow
            label={t("settings.firmNameEn")}
            value={
              <bdi dir="ltr" className="font-medium">
                Abdullah Alaamri &amp; Dr. Nawaf Alsheikh Law Firm
              </bdi>
            }
          />
          <InfoRow
            label={t("settings.firmNameAr")}
            value="عبدالله العامري ود.نواف آل الشيخ للمحاماة والاستشارات القانونية"
          />
          <InfoRow
            label={t("settings.managingPartners")}
            value={t("settings.managingPartnersValue")}
          />
          <InfoRow
            label={t("settings.location")}
            value={t("settings.locationValue")}
          />
        </SectionCard>

        {/* Section 2 — System Information */}
        <SectionCard title={t("settings.systemInfo")}>
          <InfoRow label={t("settings.version")} value={<bdi dir="ltr">v0.4.5</bdi>} />
          <InfoRow label={t("settings.environment")} value={env} />
          <InfoRow
            label={t("settings.dbStatus")}
            value={
              <Badge className="bg-green-700 text-white hover:bg-green-700">
                {t("settings.dbConnected")}
              </Badge>
            }
          />
        </SectionCard>

        {/* Section 3 — Language Preference */}
        <SectionCard title={t("settings.langPreference")}>
          <div className="flex gap-2">
            <Button
              variant={lang === "ar" ? "default" : "outline"}
              className={
                lang === "ar"
                  ? "bg-heritage-gold text-white hover:bg-heritage-gold/90"
                  : ""
              }
              onClick={() => setLang("ar")}
            >
              {t("language.ar")}
            </Button>
            <Button
              variant={lang === "en" ? "default" : "outline"}
              className={
                lang === "en"
                  ? "bg-heritage-gold text-white hover:bg-heritage-gold/90"
                  : ""
              }
              onClick={() => setLang("en")}
            >
              {t("language.en")}
            </Button>
          </div>
        </SectionCard>

        {/* Section 4 — Microsoft 365 Integration */}
        <SectionCard title={t("settings.microsoft365")}>
          <p className="text-sm text-muted-foreground">{t("settings.m365Status")}</p>
          <Button
            disabled
            className="bg-heritage-gold text-white opacity-50 cursor-not-allowed"
          >
            {t("settings.m365ConnectBtn")}
          </Button>
          <p className="text-xs text-muted-foreground">{t("settings.m365Helper")}</p>
        </SectionCard>
      </div>
    </RoleGuard>
  );
}
