// src/utils/cookies.ts
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const escaped = name.replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&");
  const match = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Seta OU remove um cookie.
 * - Se value === null, remove cookie (Max-Age=0)
 * - sameSite default "Lax".
 */
export function setCookie(
  name: string,
  value: string | null,
  days = 365,
  opts: { path?: string; sameSite?: "Lax" | "Strict" | "None"; secure?: boolean; domain?: string } = {}
) {
  if (typeof document === "undefined") return;

  const path = opts.path ?? "/";
  const sameSite = opts.sameSite ?? "Lax";
  const secureDefault = typeof location !== "undefined" && location.protocol === "https:";
  let secure = opts.secure ?? secureDefault;
  if (sameSite === "None") secure = true; // exigência do navegador

  let cookie = `${name}=`;
  if (value === null) {
    cookie += `;Max-Age=0`;
  } else {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    cookie += `${encodeURIComponent(value)};Expires=${d.toUTCString()}`;
  }

  cookie += `;Path=${path};SameSite=${sameSite}`;
  if (opts.domain) cookie += `;Domain=${opts.domain}`;
  if (secure) cookie += `;Secure`;

  document.cookie = cookie;
}
