"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/auth-provider";
import { useI18n } from "@/contexts/language-context";
import { LTR } from "@/components/bidi";

type PickUser = {
  id: string;
  name: string;
  nameAr: string;
  role: string;
  email: string;
};

export default function LoginPage() {
  const { t, lang } = useI18n();
  const { login, user, isLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = React.useState<PickUser[]>([]);
  const [selected, setSelected] = React.useState<string>("");
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    void fetch("/api/auth/users")
      .then((r) => r.json())
      .then((d) => setUsers(d.users ?? []))
      .catch(() => {});
  }, []);

  React.useEffect(() => {
    if (!isLoading && user) router.replace("/");
  }, [isLoading, user, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setBusy(true);
    try {
      await login(selected);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-near-black px-4">
      <div className="mb-8 text-center">
        <div className="text-5xl font-bold text-heritage-gold">AN</div>
        <h1 className="mt-4 max-w-xl text-xl font-medium text-white">
          {t("app.title")}
        </h1>
        <p className="mt-2 text-sm text-warm-gray">
          <LTR>{t("app.titleEn")}</LTR>
        </p>
      </div>
      <Card className="w-full max-w-md border-heritage-gold/30 bg-[#252525]">
        <CardHeader>
          <CardTitle className="text-white">{t("login.title")}</CardTitle>
          <CardDescription className="text-warm-gray">
            {t("login.subtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">
                {t("login.pickUser")}
              </label>
              <Select
                value={selected}
                onValueChange={(v) => setSelected(v ?? "")}
              >
                <SelectTrigger className="border-heritage-gold/40 bg-near-black">
                  <SelectValue placeholder={t("login.pickUser")} />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {lang === "ar" ? u.nameAr : u.name} — {u.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="submit"
              className="w-full bg-heritage-gold text-near-black hover:bg-heritage-gold/90"
              disabled={busy || !selected}
            >
              {t("login.signIn")}
            </Button>
          </form>
        </CardContent>
      </Card>
      <p className="mt-6 text-center text-xs text-warm-gray">
        <LTR>{t("login.devMode")}</LTR>
      </p>
    </div>
  );
}
