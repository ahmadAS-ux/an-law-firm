"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useI18n } from "@/contexts/language-context";
import { useAuth } from "@/contexts/auth-provider";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [data, setData] = React.useState<{
    activeCases: number;
    pendingTasks: number;
    hoursThisWeek: number;
    unreadNotifications: number;
  } | null>(null);

  React.useEffect(() => {
    void fetch("/api/dashboard/summary")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, []);

  if (!data) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground">
          {user?.name} — {user?.role}
        </p>
        <Link
          href="/work-logs"
          className={cn(
            buttonVariants(),
            "bg-heritage-gold text-near-black hover:bg-heritage-gold/90",
          )}
        >
          {t("nav.workLogs")}
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-heritage-gold/40">
          <CardHeader>
            <CardTitle className="text-base">{t("nav.cases")}</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-heritage-gold">
            {data.activeCases}
          </CardContent>
        </Card>
        <Card className="border-heritage-gold/40">
          <CardHeader>
            <CardTitle className="text-base">{t("nav.tasks")}</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-heritage-gold">
            {data.pendingTasks}
          </CardContent>
        </Card>
        <Card className="border-heritage-gold/40">
          <CardHeader>
            <CardTitle className="text-base">Hours (7d)</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-heritage-gold">
            {data.hoursThisWeek.toFixed(1)}
          </CardContent>
        </Card>
        <Card className="border-heritage-gold/40">
          <CardHeader>
            <CardTitle className="text-base">{t("nav.notifications")}</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-heritage-gold">
            {data.unreadNotifications}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
