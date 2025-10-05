export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function setCookie(
  name: string,
  value: string,
  days = 365,
  opts: { path?: string; sameSite?: "Lax" | "Strict" | "None"; secure?: boolean } = {}
) {
  if (typeof document === "undefined") return;
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  const path = opts.path ?? "/";
  const sameSite = opts.sameSite ?? "Lax";
  const secure = opts.secure ?? (typeof location !== "undefined" && location.protocol === "https:");
  document.cookie =
    `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=${path};SameSite=${sameSite}` +
    (secure ? ";Secure" : "");
}
