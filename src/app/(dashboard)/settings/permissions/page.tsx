"use client";

import * as React from "react";
import { Lock } from "lucide-react";
import { useI18n } from "@/contexts/language-context";
import { useAuth } from "@/contexts/auth-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface RoleRow {
  id: string;
  name: string;
  nameAr: string;
}
interface PermissionRow {
  id: string;
  key: string;
  category: string;
  description: string;
  descriptionAr: string;
}
interface RolePermRow {
  id: string;
  roleId: string;
  permissionId: string;
  granted: boolean;
  scope: string;
  isLocked: boolean;
  lockedDirection: string | null;
}

type MatrixState = Record<string, Record<string, { granted: boolean; scope: string; isLocked: boolean; lockedDirection: string | null }>>;

export default function PermissionsPage() {
  const { t, lang } = useI18n();
  const { user } = useAuth();

  const [roles, setRoles] = React.useState<RoleRow[]>([]);
  const [permissions, setPermissions] = React.useState<PermissionRow[]>([]);
  const [matrix, setMatrix] = React.useState<MatrixState>({});
  const [dirty, setDirty] = React.useState<MatrixState>({});
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch("/api/permissions/matrix")
      .then((r) => r.json())
      .then((data: { roles: RoleRow[]; permissions: PermissionRow[]; rolePermissions: RolePermRow[] }) => {
        setRoles(data.roles);
        setPermissions(data.permissions);

        const m: MatrixState = {};
        for (const rp of data.rolePermissions) {
          if (!m[rp.roleId]) m[rp.roleId] = {};
          m[rp.roleId][rp.permissionId] = {
            granted: rp.granted,
            scope: rp.scope,
            isLocked: rp.isLocked,
            lockedDirection: rp.lockedDirection,
          };
        }
        setMatrix(m);
        setDirty(JSON.parse(JSON.stringify(m)));
        setLoading(false);
      })
      .catch(() => { setError("Failed to load permissions"); setLoading(false); });
  }, []);

  const isPartner = user?.role === "PARTNER";

  function toggleGrant(roleId: string, permId: string) {
    const cell = dirty[roleId]?.[permId];
    if (!cell || cell.isLocked) return;
    setDirty((prev) => ({
      ...prev,
      [roleId]: {
        ...prev[roleId],
        [permId]: { ...cell, granted: !cell.granted },
      },
    }));
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setShowConfirm(false);

    const updates: Array<{ roleId: string; permissionId: string; granted: boolean; scope: string }> = [];
    for (const roleId of Object.keys(dirty)) {
      for (const permId of Object.keys(dirty[roleId])) {
        const orig = matrix[roleId]?.[permId];
        const curr = dirty[roleId][permId];
        if (!curr.isLocked && orig && orig.granted !== curr.granted) {
          updates.push({ roleId, permissionId: permId, granted: curr.granted, scope: curr.scope });
        }
      }
    }

    if (updates.length === 0) { setSaving(false); return; }

    const res = await fetch("/api/permissions/matrix", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (res.ok) {
      setMatrix(JSON.parse(JSON.stringify(dirty)));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      const err = await res.json();
      setError(err.error ?? "Save failed");
    }
    setSaving(false);
  }

  const categories = Array.from(new Set(permissions.map((p) => p.category))).sort();

  if (!isPartner) {
    return <p className="text-sm text-muted-foreground">{t("common.noData")}</p>;
  }
  if (loading) return <p className="text-sm text-muted-foreground">{t("common.loading")}</p>;
  if (error) return <p className="text-sm text-destructive">{error}</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold">{t("settings.permissions.title")}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{t("settings.permissions.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="text-xs text-green-600">{t("settings.permissions.saved")}</span>}
          <Button
            size="sm"
            className="bg-heritage-gold text-white hover:bg-heritage-gold/90"
            onClick={() => setShowConfirm(true)}
            disabled={saving}
          >
            {saving ? t("settings.permissions.saving") : t("settings.permissions.save")}
          </Button>
        </div>
      </div>

      {showConfirm && (
        <div className="rounded-md border border-heritage-gold/40 bg-heritage-gold/5 p-4 space-y-3">
          <p className="text-sm font-medium">{t("settings.permissions.confirmTitle")}</p>
          <p className="text-xs text-muted-foreground">{t("settings.permissions.confirmBody")}</p>
          <div className="flex gap-2">
            <Button size="sm" className="bg-heritage-gold text-white hover:bg-heritage-gold/90" onClick={handleSave}>
              {t("common.confirm")}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowConfirm(false)}>
              {t("common.cancel")}
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-muted/50">
              <th className="text-start px-3 py-2 font-medium min-w-[180px]">{t("perm.category.matter")}</th>
              {roles.map((r) => (
                <th key={r.id} className="px-2 py-2 font-medium text-center min-w-[90px]">
                  {lang === "ar" ? r.nameAr : r.name.replace(/_/g, " ")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => {
              const catPerms = permissions.filter((p) => p.category === cat);
              return (
                <React.Fragment key={cat}>
                  <tr className="bg-muted/30">
                    <td colSpan={roles.length + 1} className="px-3 py-1 font-semibold text-xs text-muted-foreground uppercase tracking-wide">
                      {t(`perm.category.${cat}`)}
                    </td>
                  </tr>
                  {catPerms.map((perm) => (
                    <tr key={perm.id} className="border-t border-border/50 hover:bg-muted/20">
                      <td className="px-3 py-2 text-start">
                        {lang === "ar" ? perm.descriptionAr : perm.description}
                      </td>
                      {roles.map((role) => {
                        const cell = dirty[role.id]?.[perm.id];
                        if (!cell) return <td key={role.id} className="px-2 py-2 text-center">—</td>;

                        const locked = cell.isLocked;
                        const isOn = cell.lockedDirection === "ON";

                        return (
                          <td key={role.id} className="px-2 py-2 text-center">
                            {locked ? (
                              <span
                                title={isOn ? t("settings.permissions.lockedOn") : t("settings.permissions.lockedOff")}
                                className={`inline-flex items-center justify-center gap-1 ${isOn ? "text-green-600" : "text-muted-foreground"}`}
                              >
                                <Lock className="w-3 h-3" />
                                <span>{isOn ? "✓" : "✗"}</span>
                              </span>
                            ) : (
                              <input
                                type="checkbox"
                                checked={cell.granted}
                                onChange={() => toggleGrant(role.id, perm.id)}
                                className="w-4 h-4 accent-heritage-gold cursor-pointer"
                              />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Lock className="w-3 h-3 text-green-600" /> <span className="text-green-600">✓</span> — {t("settings.permissions.lockedOn")}</span>
        <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> <span>✗</span> — {t("settings.permissions.lockedOff")}</span>
      </div>

      {/* Scope badges legend */}
      <div className="flex flex-wrap gap-2 text-xs">
        {(["ALL", "OWN_DEPARTMENT", "OWN", "PARTIAL"] as const).map((s) => (
          <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>
        ))}
        <span className="text-muted-foreground self-center">— scope shown in role tooltip</span>
      </div>
    </div>
  );
}
