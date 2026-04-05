"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  ListTodo,
  Clock,
  Calendar,
  FolderOpen,
  Scale,
  BarChart3,
  ScrollText,
  GitMerge,
  Bell,
  UserCog,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/contexts/language-context";
import { PermissionGuard, RoleGuard } from "@/components/role-guard";
import type { Role } from "@/lib/permissions";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-provider";

const links = [
  { href: "/", key: "nav.dashboard", icon: LayoutDashboard, guard: null },
  { href: "/clients", key: "nav.clients", icon: Users, guard: null },
  { href: "/cases", key: "nav.cases", icon: Briefcase, guard: null },
  { href: "/tasks", key: "nav.tasks", icon: ListTodo, guard: null },
  { href: "/work-logs", key: "nav.workLogs", icon: Clock, guard: null },
  { href: "/calendar", key: "nav.calendar", icon: Calendar, guard: null },
  { href: "/files", key: "nav.files", icon: FolderOpen, guard: null },
  {
    href: "/services",
    key: "nav.services",
    icon: Scale,
    guard: "role" as const,
    roles: ["ADMIN"] as const,
  },
  {
    href: "/hr-reports",
    key: "nav.hrReports",
    icon: BarChart3,
    guard: "perm" as const,
    perm: "viewHRReports" as const,
  },
  {
    href: "/audit-log",
    key: "nav.auditLog",
    icon: ScrollText,
    guard: "role" as const,
    roles: ["PARTNER", "ADMIN"] as const,
  },
  {
    href: "/conflict-check",
    key: "nav.conflictCheck",
    icon: GitMerge,
    guard: null,
  },
  {
    href: "/notifications",
    key: "nav.notifications",
    icon: Bell,
    guard: null,
  },
  {
    href: "/users",
    key: "nav.users",
    icon: UserCog,
    guard: "perm" as const,
    perm: "manageUsers" as const,
  },
  {
    href: "/settings",
    key: "nav.settings",
    icon: Settings,
    guard: "perm" as const,
    perm: "systemSettings" as const,
  },
] as const;

function NavLink({
  href,
  label,
  Icon,
  active,
}: {
  href: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
        active
          ? "bg-heritage-gold/15 text-heritage-gold"
          : "text-muted-foreground hover:bg-white/5 hover:text-white",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

export function AppSidebarNav({ mobile }: { mobile?: boolean }) {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <div className={cn("flex flex-col gap-1", mobile ? "" : "py-2")}>
      {links.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        const label = t(item.key);
        const inner = (
          <NavLink
            href={item.href}
            label={label}
            Icon={item.icon}
            active={active}
          />
        );
        if (item.guard === "perm") {
          return (
            <PermissionGuard key={item.href} permission={item.perm}>
              {inner}
            </PermissionGuard>
          );
        }
        if (item.guard === "role") {
          return (
            <RoleGuard
              key={item.href}
              roles={[...(item as { roles: readonly Role[] }).roles]}
            >
              {inner}
            </RoleGuard>
          );
        }
        return <div key={item.href}>{inner}</div>;
      })}
    </div>
  );
}

export function AppSidebar() {
  const { t } = useI18n();
  const { user, logout } = useAuth();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-e border-heritage-gold/20 bg-[#141414] md:flex">
      <div className="flex h-14 items-center justify-center border-b border-heritage-gold/20 text-2xl font-bold text-heritage-gold">
        AN
      </div>
      <div className="flex-1 overflow-y-auto px-2">
        <AppSidebarNav />
      </div>
      <div className="space-y-2 border-t border-heritage-gold/20 p-3">
        <div className="text-xs text-muted-foreground">
          <div className="truncate font-medium text-white">{user?.name}</div>
          <div>{user?.role}</div>
        </div>
        <LanguageSwitcher />
        <Button
          variant="outline"
          className="w-full border-heritage-gold/40"
          onClick={() => void logout()}
        >
          {t("logout")}
        </Button>
      </div>
    </aside>
  );
}
