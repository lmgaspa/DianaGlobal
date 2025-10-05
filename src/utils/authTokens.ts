// src/utils/authTokens.ts
"use client";

import { getSession } from "next-auth/react";
import {
  getAccessToken as memGet,
  setAccessToken,
  doRefresh,
} from "@/lib/api";

/**
 * Garante um access token válido (prioriza memória; tenta session; faz refresh).
 */
export async function ensureAccessToken(): Promise<string | undefined> {
  const mem = memGet();
  if (mem) return mem;

  // tenta obter da sessão do NextAuth
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
  } catch {
    /* ignore */
  }

  // tenta refresh via cookie + CSRF
  try {
    const refreshed = await doRefresh();
    return refreshed;
  } catch {
    return undefined;
  }
}

/** 🔧 Alias para compatibilidade com código existente */
export async function getAccessToken(): Promise<string | undefined> {
  return ensureAccessToken();
}

/**
 * 🔧 Compat: alguns pontos ainda importam getRefreshToken().
 * Como agora usamos refresh **em cookie HttpOnly**, o front não consegue ler.
 * Mesmo assim, expomos um helper que tenta pegar da sessão do NextAuth (se existir).
 */
export async function getRefreshToken(): Promise<string | undefined> {
  try {
    const session = await getSession();
    const r =
      (session as any)?.refreshToken ||
      (session as any)?.rt ||
      (session as any)?.refresh;
    if (typeof r === "string" && r) return r;
  } catch {
    /* ignore */
  }
  // Em cookie HttpOnly não dá pra ler no front — retornamos undefined.
  return undefined;
}
