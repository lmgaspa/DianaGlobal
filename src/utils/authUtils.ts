// src/utils/authTokens.ts
"use client";

import { getSession } from "next-auth/react";

const ACCESS = "access_token";
const REFRESH = "refresh_token";

export async function getAccessToken(): Promise<string | undefined> {
  // 1) tenta NextAuth
  try {
    const session = await getSession();
    const tokenFromSession = (session as any)?.accessToken as string | undefined;
    if (tokenFromSession) return tokenFromSession;
  } catch {}

  // 2) fallback localStorage
  try {
    if (typeof window !== "undefined") {
      const t = localStorage.getItem(ACCESS) || undefined;
      if (t) return t;
    }
  } catch {}
  return undefined;
}

export async function getRefreshToken(): Promise<string | undefined> {
  // tenta NextAuth
  try {
    const session = await getSession();
    const r = (session as any)?.refreshToken as string | undefined;
    if (r) return r;
  } catch {}

  // fallback localStorage
  try {
    if (typeof window !== "undefined") {
      const t = localStorage.getItem(REFRESH) || undefined;
      if (t) return t;
    }
  } catch {}
  return undefined;
}
