// src/lib/authFetch.ts
import {
  captureCsrfFromFetchResponse,
  injectCsrfIntoFetchInit,
} from "@/lib/security/csrf";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://dianagloballoginregister-52599bd07634.herokuapp.com";

// simples cache em memória (se você já usa outra store, substitua)
const mem = {
  access: undefined as string | undefined,
};
export function setAccess(t?: string) {
  mem.access = t;
}
export function getAccess(): string | undefined {
  return mem.access;
}

async function refreshAccess(): Promise<string | null> {
  // Validação: não tenta refresh em páginas públicas ou sem cookie
  const { shouldAttemptRefresh } = await import("@/utils/refreshValidation");
  if (!shouldAttemptRefresh()) {
    return null;
  }

  const res = await fetch(`${API_BASE}/api/v1/auth/refresh-token`, {
    method: "POST",
    credentials: "include",
    ...injectCsrfIntoFetchInit({}),
  });
  captureCsrfFromFetchResponse(res);
  if (!res.ok) return null;
  const data = await res.json();
  const token = data?.token || data?.access || data?.jwt || null;
  if (token) setAccess(token);
  return token;
}

/** fetch com auto-reauth + CSRF centralizado (OCP) */
export async function authFetch(input: RequestInfo, init: RequestInit = {}) {
  const doFetch = async (access?: string) => {
    const headers = new Headers(init.headers || {});
    if (access) headers.set("Authorization", `Bearer ${access}`);
    const req = {
      ...injectCsrfIntoFetchInit(init),
      headers,
      credentials: "include" as const,
    };
    const res = await fetch(input, req);
    captureCsrfFromFetchResponse(res);
    return res;
  };

  const access = getAccess();
  let res = await doFetch(access);

  if (res.status === 401) {
    const newAccess = await refreshAccess();
    if (!newAccess) return res;
    res = await doFetch(newAccess);
  }
  return res;
}
