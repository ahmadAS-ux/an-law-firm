import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, secretMatches, verifySession } from "@/lib/session-token";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/uploads" || pathname.startsWith("/uploads/")) return new NextResponse(null, { status: 404 });
  if (process.env.STAGING_BASIC_AUTH) {
    let credentials = "";
    try {
      const header = request.headers.get("authorization") ?? "";
      if (/^Basic /i.test(header)) credentials = atob(header.slice(6));
    } catch { /* malformed credentials deny */ }
    if (!await secretMatches(credentials, process.env.STAGING_BASIC_AUTH)) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: { "WWW-Authenticate": 'Basic realm="A&N staging", charset="UTF-8"', "Cache-Control": "no-store" } });
  }
  const pickerPath = pathname === "/api/auth/users" || (pathname === "/api/auth/login" && request.method !== "DELETE");
  if (pickerPath && process.env.DEV_LOGIN_PICKER_ENABLED !== "true") return new NextResponse(null, { status: 404 });
  if (["/login", "/api/auth/login", "/api/auth/users", "/api/auth/me", "/api/uploads-denied", "/favicon.ico", "/logo.png"].includes(pathname)) return NextResponse.next();
  if (
    pathname.startsWith("/_next/") || pathname.startsWith("/fonts/") || pathname.startsWith("/images/")
  ) {
    return NextResponse.next();
  }
  const uid = await verifySession(request.cookies.get(AUTH_COOKIE_NAME)?.value, process.env.NEXTAUTH_SECRET);
  if (!uid) {
    if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
