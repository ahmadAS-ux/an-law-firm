export const AUTH_COOKIE_NAME = "an-auth";
const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8", { fatal: true });
export const SESSION_SECONDS = 12 * 60 * 60;
export function validSecret(secret: string | undefined): secret is string {
  return !!secret && encoder.encode(secret).length >= 32;
}
function encode(bytes: Uint8Array): string {
  return btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join("")).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function decode(value: string): Uint8Array {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) throw new Error("Malformed encoding");
  const bytes = Uint8Array.from(atob(value.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
  if (encode(bytes) !== value) throw new Error("Non-canonical encoding");
  return bytes;
}
async function key(secret: string) {
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}
export async function signSession(uid: string, secret: string | undefined, now = Math.floor(Date.now() / 1000)) {
  if (!validSecret(secret) || !uid) throw new Error("Session configuration unavailable");
  const payload = encode(encoder.encode(JSON.stringify({ uid, iat: now, exp: now + SESSION_SECONDS })));
  return `${payload}.${encode(new Uint8Array(await crypto.subtle.sign("HMAC", await key(secret), encoder.encode(payload))))}`;
}
export async function verifySession(token: string | undefined, secret: string | undefined, now = Math.floor(Date.now() / 1000)): Promise<string | null> {
  if (!validSecret(secret) || !token || token.length > 4096) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [payload, signature] = parts;
    const bytes = decode(signature);
    if (bytes.length !== 32 || !await crypto.subtle.verify("HMAC", await key(secret), bytes as BufferSource, encoder.encode(payload))) return null;
    const value = JSON.parse(decoder.decode(decode(payload))) as Record<string, unknown>;
    if (typeof value.uid !== "string" || !value.uid || value.uid.length > 256 || typeof value.iat !== "number" || typeof value.exp !== "number" ||
      !Number.isSafeInteger(value.iat) || !Number.isSafeInteger(value.exp) || value.exp <= now || value.iat > now || value.exp - value.iat !== SESSION_SECONDS) return null;
    return value.uid;
  } catch { return null; }
}
export async function secretMatches(supplied: unknown, expected: string | undefined): Promise<boolean> {
  if (typeof supplied !== "string" || !expected || supplied.length > 4096) return false;
  const a = new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(supplied)));
  const b = new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(expected)));
  let difference = 0;
  for (let i = 0; i < a.length; i++) difference |= a[i] ^ b[i];
  return difference === 0;
}
