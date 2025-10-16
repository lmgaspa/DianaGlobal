// src/lib/api.ts
"use client";

import axios from "axios";
import { getCookie } from "@/utils/cookies";

/** Base da API */
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://dianagloballoginregister-52599bd07634.herokuapp.com";

/** Access token em memória (não usa localStorage) */
let accessTokenMem: string | undefined;

export function getAccessToken() {
  return accessTokenMem;
}
export function setAccessToken(token?: string) {
  accessTokenMem = token;
}
export function clearAccessToken() {
  accessTokenMem = undefined;
}

/** Faz refresh chamando o backend e retorna novo access */
export async function doRefresh(): Promise<string> {
  // csrf_token é não-HttpOnly de propósito
  const csrf = getCookie("csrf_token") ?? "";
  const res = await fetch(`${API_BASE}/api/auth/refresh-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrf,
    },
    credentials: "include", // envia refresh cookie
  });

  if (!res.ok) {
    clearAccessToken();
    throw new Error(`refresh_failed_${res.status}`);
  }

  const data = await res.json(); // { token: "..." } ou { accessToken: "..." }
  const newAccess =
    data?.token || data?.accessToken || data?.jwt || data?.access || "";

  if (!newAccess) {
    clearAccessToken();
    throw new Error("refresh_bad_payload");
  }

  setAccessToken(newAccess);
  return newAccess;
}

/** Axios instance com interceptor de auth + auto refresh */
export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // envia cookies (refresh/csrf_cookie)
});

api.interceptors.request.use((config) => {
  const t = getAccessToken();
  if (t) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${t}`;
  }
  return config;
});

let refreshing = false;
let pendingQueue: Array<() => void> = [];

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    const status = error?.response?.status;

    // evita loop infinito
    if (status === 401 && !original._retried) {
      if (!refreshing) {
        refreshing = true;
        try {
          await doRefresh();
          refreshing = false;
          pendingQueue.forEach((resume) => resume());
          pendingQueue = [];
        } catch (e) {
          refreshing = false;
          pendingQueue = [];
          return Promise.reject(error);
        }
      }

      // espera refresh terminar, reaplica request
      return new Promise((resolve) => {
        pendingQueue.push(async () => {
          original._retried = true;
          const t = getAccessToken();
          original.headers = original.headers ?? {};
          if (t) (original.headers as any).Authorization = `Bearer ${t}`;
          resolve(api(original));
        });
      });
    }

    return Promise.reject(error);
  }
);

/** Se quiser inicializar a partir do NextAuth session */
export function primeAccessFromNextAuth(session: any) {
  const t =
    session?.accessToken || session?.jwt || session?.access || session?.token;
  if (typeof t === "string" && t) setAccessToken(t);
}
