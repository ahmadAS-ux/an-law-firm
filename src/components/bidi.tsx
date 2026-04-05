import * as React from "react";

export function LTR({ children }: { children: React.ReactNode }) {
  return (
    <bdi dir="ltr" style={{ unicodeBidi: "isolate" }}>
      {children}
    </bdi>
  );
}

export function RTL({ children }: { children: React.ReactNode }) {
  return (
    <bdi dir="rtl" style={{ unicodeBidi: "isolate" }}>
      {children}
    </bdi>
  );
}
