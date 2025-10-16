// src/lib/authFetch.ts
import { getCookie } from "@/utils/cookies";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://dianagloballoginregister-52599bd07634.herokuapp.com";

async function refreshAccess(): Promise<string | null> {
  const csrf = getCookie("csrf_token");
  const res = await fetch(`${API_BASE}/api/auth/refresh-token`, {
    method: "POST",
    credentials: "include",                // manda refresh_token
    headers: { "X-CSRF-Token": csrf || "" }
  });
  if (!res.ok) return null;
  const data = await res.json();           // { token: "..." } (JwtResponse)
  return data?.token || data?.access || null;
}

export async function authFetch(input: RequestInfo, init: RequestInit = {}) {
  const doFetch = async (access?: string) => {
    const headers = new Headers(init.headers || {});
    if (access) headers.set("Authorization", `Bearer ${access}`);
    return fetch(input, { ...init, headers, credentials: "include" }); // <- importante
  };

  // 1ª tentativa (usa access da tua store/NextAuth se tiver)
  let access = (globalThis as any).__ACCESS_TOKEN as string | undefined;
  let res = await doFetch(access);

  if (res.status === 401) {
    // tenta renovar
    const newAccess = await refreshAccess();
    if (!newAccess) return res;
    (globalThis as any).__ACCESS_TOKEN = newAccess;
    res = await doFetch(newAccess); // repete com novo access
  }
  return res;
}
