"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Search } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { NotificationBell } from "@/components/layout/notification-bell";
import { useI18n } from "@/contexts/language-context";
import { AppSidebarNav } from "@/components/layout/sidebar";
import { useAuth } from "@/contexts/auth-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const pathTitles: Record<string, string> = {
  "/": "nav.dashboard",
  "/clients": "nav.clients",
  "/cases": "nav.cases",
  "/tasks": "nav.tasks",
  "/work-logs": "nav.workLogs",
  "/calendar": "nav.calendar",
  "/files": "nav.files",
  "/services": "nav.services",
  "/hr-reports": "nav.hrReports",
  "/audit-log": "nav.auditLog",
  "/conflict-check": "nav.conflictCheck",
  "/notifications": "nav.notifications",
  "/users": "nav.users",
  "/settings": "nav.settings",
};

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();
  const { user, logout } = useAuth();
  const titleKey =
    pathTitles[pathname] ??
    (pathname.startsWith("/clients/")
      ? "nav.clients"
      : pathname.startsWith("/cases/")
        ? "nav.cases"
        : pathname.startsWith("/tasks/")
          ? "nav.tasks"
          : "nav.dashboard");

  const [q, setQ] = React.useState("");

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    router.push(`/clients?search=${encodeURIComponent(q.trim())}`);
  }

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-heritage-gold/20 bg-[#1f1f1f]/95 px-3 backdrop-blur md:px-6">
      <Sheet>
        <SheetTrigger
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "md:hidden",
          )}
        >
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent
          side="right"
          className="w-72 border-heritage-gold/20 bg-near-black p-0"
        >
          <div className="border-b border-heritage-gold/20 p-4 text-xl font-bold text-heritage-gold">
            AN
          </div>
          <nav className="p-2">
            <AppSidebarNav mobile />
          </nav>
        </SheetContent>
      </Sheet>

      <h1 className="min-w-0 flex-1 truncate text-lg font-semibold text-white">
        {t(titleKey)}
      </h1>

      <form onSubmit={onSearch} className="hidden max-w-sm flex-1 md:flex">
        <div className="relative w-full">
          <Search className="absolute start-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("common.search")}
            className="bg-background/50 ps-8"
          />
        </div>
      </form>

      <LanguageSwitcher compact />
      <NotificationBell />

      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "gap-2 px-1 outline-none",
          )}
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-heritage-gold/20 text-heritage-gold">
              {user?.name?.slice(0, 2).toUpperCase() ?? "AN"}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>
            <div className="font-medium">{user?.name}</div>
            <div className="text-xs text-muted-foreground">{user?.role}</div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push("/settings")}>
            {t("nav.settings")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => void logout()}>
            {t("logout")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
