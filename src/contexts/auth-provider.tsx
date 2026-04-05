"use client";

import * as React from "react";
import type { User } from "@prisma/client";
import { useRouter } from "next/navigation";

type AuthCtx = {
  user: User | null;
  isLoading: boolean;
  login: (userId: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const Ctx = React.createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const router = useRouter();

  const refresh = React.useCallback(async () => {
    const res = await fetch("/api/auth/me", { credentials: "include" });
    if (!res.ok) {
      setUser(null);
      return;
    }
    const data = await res.json();
    setUser(data.user ?? null);
  }, []);

  React.useEffect(() => {
    void refresh().finally(() => setIsLoading(false));
  }, [refresh]);

  const login = React.useCallback(
    async (userId: string) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error("Login failed");
      const data = await res.json();
      setUser(data.user);
      router.replace("/");
      router.refresh();
    },
    [router],
  );

  const logout = React.useCallback(async () => {
    await fetch("/api/auth/login", { method: "DELETE", credentials: "include" });
    setUser(null);
    router.replace("/login");
    router.refresh();
  }, [router]);

  const value = React.useMemo(
    () => ({ user, isLoading, login, logout, refresh }),
    [user, isLoading, login, logout, refresh],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthCtx {
  const v = React.useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
