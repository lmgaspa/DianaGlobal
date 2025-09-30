// src/utils/authTokens.ts
"use client";
import { getSession } from "next-auth/react";

export async function getAccessToken(): Promise<string | undefined> {
  try {
    const session = await getSession();
    const t = (session as any)?.accessToken as string | undefined;
    if (t) return t;
  } catch {}
  try {
    if (typeof window !== "undefined") {
      return localStorage.getItem("access_token") || undefined;
    }
  } catch {}
  return undefined;
}

export async function getRefreshToken(): Promise<string | undefined> {
  try {
    const session = await getSession();
    const t = (session as any)?.refreshToken as string | undefined;
    if (t) return t;
  } catch {}
  try {
    if (typeof window !== "undefined") {
      return localStorage.getItem("refresh_token") || undefined;
    }
  } catch {}
  return undefined;
}
