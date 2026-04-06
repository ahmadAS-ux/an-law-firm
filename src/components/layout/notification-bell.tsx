"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n } from "@/contexts/language-context";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BidiStr } from "@/components/bidi";

export function NotificationBell() {
  const router = useRouter();
  const { lang, t } = useI18n();
  const [count, setCount] = React.useState(0);
  const [items, setItems] = React.useState<
    { id: string; title: string; titleAr: string; link: string | null }[]
  >([]);

  React.useEffect(() => {
    void fetch("/api/notifications?limit=5")
      .then((r) => r.json())
      .then((d) => {
        setCount(d.unreadCount ?? 0);
        setItems(d.items ?? []);
      })
      .catch(() => {});
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "relative text-heritage-gold",
        )}
      >
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <Badge className="absolute -end-1 -top-1 h-5 min-w-5 px-1 text-[10px]">
            {count > 9 ? "9+" : count}
          </Badge>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>{t("notifications.title")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.length === 0 && (
          <div className="px-2 py-3 text-sm text-muted-foreground">
            {t("common.noData")}
          </div>
        )}
        {items.map((n) => (
          <DropdownMenuItem
            key={n.id}
            onClick={() => n.link && router.push(n.link)}
          >
            {lang === "ar" ? <BidiStr text={n.titleAr} /> : n.title}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/notifications")}>
          {t("nav.notifications")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
