// src/lib/tokens.ts
"use client";

import { getSession } from "next-auth/react";
import { getAccessToken as memGet, setAccessToken, doRefresh } from "@/lib/api";

/**
 * Obtém um access token válido SEM usar localStorage.
 * Ordem:
 *  1) memória (setada pelos interceptors / login),
 *  2) NextAuth session (se existir, adotamos e guardamos em memória),
 *  3) tenta refresh (via cookie HttpOnly + CSRF) e retorna o novo access.
 */
export async function getAccessToken(): Promise<string | undefined> {
  // 1) memória
  const inMemory = memGet();
  if (inMemory) return inMemory;

  // 2) NextAuth session
  try {
    const session = await getSession();
    const fromSession = (session as any)?.accessToken as string | undefined;
    if (fromSession) {
      setAccessToken(fromSession);
      return fromSession;
    }
  } catch {
    // ignora, seguimos pro refresh
  }

  // 3) tenta refresh (usa cookie HttpOnly no backend)
  try {
    const refreshed = await doRefresh(); // retorna string | null
    return refreshed ?? undefined;
  } catch {
    return undefined;
  }
}

/**
 * Refresh token NÃO deve ser exposto no front (fica em cookie HttpOnly).
 * Mantemos a função por compatibilidade, mas sempre retorna undefined.
 */
export async function getRefreshToken(): Promise<string | undefined> {
  return undefined;
}
