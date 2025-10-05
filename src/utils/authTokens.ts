// src/utils/authTokens.ts
"use client";
import { getSession } from "next-auth/react";
import { getAccessToken as memGet, setAccessToken, doRefresh } from "@/lib/api";

/**
 * Retorna um access token válido (prioriza memória; faz refresh se precisar).
 */
export async function ensureAccessToken(): Promise<string | undefined> {
  const mem = memGet();
  if (mem) return mem;

  // tenta da sessão do NextAuth
  try {
    const session = await getSession();
    const fromSession =
      (session as any)?.accessToken ||
      (session as any)?.jwt ||
      (session as any)?.access;
    if (typeof fromSession === "string" && fromSession) {
      setAccessToken(fromSession);
      return fromSession;
    }
  } catch {}

  // tenta refresh via cookie + CSRF
  try {
    const refreshed = await doRefresh();
    return refreshed;
  } catch {
    return undefined;
  }
}
