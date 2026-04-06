import * as React from "react";

/** Wrap an English/LTR fragment inside Arabic text */
export function LTR({ children }: { children: React.ReactNode }) {
  return (
    <bdi dir="ltr" style={{ unicodeBidi: "isolate" }}>
      {children}
    </bdi>
  );
}

/** Wrap an Arabic/RTL fragment inside English text */
export function RTL({ children }: { children: React.ReactNode }) {
  return (
    <bdi dir="rtl" style={{ unicodeBidi: "isolate" }}>
      {children}
    </bdi>
  );
}

/**
 * Renders a mixed Arabic+English string correctly.
 *
 * Splits the string on Latin runs and wraps each Latin segment in
 * <bdi dir="ltr"> so the browser BiDi algorithm doesn't scramble word order.
 *
 * Use this for ANY Arabic i18n string that contains English words,
 * brand names, numbers with units, or technical terms.
 *
 * Example:
 *   <BidiStr text={t("login.devMode")} />
 *   → "وضع التطوير — تسجيل الدخول عبر <bdi>Microsoft</bdi> قريباً"
 */
export function BidiStr({ text }: { text: string }) {
  // Split on Latin runs (letters, digits, common punctuation used in brand names)
  const parts = text.split(/([A-Za-z][A-Za-z0-9\s.,&/@():-]*)/g);
  return (
    <>
      {parts.map((part, i) =>
        /^[A-Za-z]/.test(part) ? (
          <bdi key={i} dir="ltr" style={{ unicodeBidi: "isolate" }}>
            {part}
          </bdi>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        ),
      )}
    </>
  );
}
