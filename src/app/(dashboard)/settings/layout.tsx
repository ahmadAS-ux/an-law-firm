"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/contexts/language-context";
import { useAuth } from "@/contexts/auth-provider";
import { hasPermission } from "@/lib/permissions";
import { cn } from "@/lib/utils";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const pathname = usePathname();
  const { user } = useAuth();

  const tabs = [
    { key: "general",     label: t("settings.tabGeneral"),     href: "/settings",                 show: true },
    { key: "permissions", label: t("settings.tabPermissions"), href: "/settings/permissions",     show: user ? hasPermission(user.role, "manageUsers") || user.role === "PARTNER" : false },
    { key: "departments", label: t("settings.tabDepartments"), href: "/settings/departments",     show: user?.role === "PARTNER" || user?.role === "ADMIN" },
    { key: "users",       label: t("settings.tabUsers"),       href: "/users",                    show: user ? hasPermission(user.role, "manageUsers") : false },
  ].filter((t) => t.show);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">{t("settings.title")}</h1>
      <nav className="flex gap-1 border-b border-border pb-0" aria-label="Settings navigation">
        {tabs.map((tab) => {
          const isActive = tab.href === "/settings"
            ? pathname === "/settings"
            : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.key}
              href={tab.href}
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
                isActive
                  ? "border-heritage-gold text-heritage-gold"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
      <div>{children}</div>
    </div>
  );
}
