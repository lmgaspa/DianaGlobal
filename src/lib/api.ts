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

// === Confirm e-mail resend (throttled) ===============================

export type ConfirmResendPayload = {
  status?: "CONFIRMATION_EMAIL_SENT" | "ALREADY_CONFIRMED";
  error?: "TOO_MANY_REQUESTS" | string;
  message?: string;
  canResend?: boolean;
  cooldownSecondsRemaining?: number;
  attemptsToday?: number;
  maxPerDay?: number;
  nextAllowedAt?: string; // ISO string
};

export interface ConfirmResendResult {
  ok: boolean;
  status: number;
  data: ConfirmResendPayload;
}

/**
 * Reenvia o e-mail de confirmação com cooldown (backend retorna metadados).
 * - 200 OK  => { status: "CONFIRMATION_EMAIL_SENT", ... }
 * - 409     => (p.ex. ALREADY_CONFIRMED)
 * - 429     => { error: "TOO_MANY_REQUESTS", cooldownSecondsRemaining, ... }
 */
export async function confirmResend(email: string): Promise<ConfirmResendResult> {
  const body = { email: (email ?? "").trim().toLowerCase() };

  try {
    const res = await api.post("/api/auth/confirm/resend", body);
    return { ok: true, status: res.status, data: res.data as ConfirmResendPayload };
  } catch (err: any) {
    const res = err?.response;
    if (res) {
      return {
        ok: res.status >= 200 && res.status < 300,
        status: res.status,
        data: res.data as ConfirmResendPayload,
      };
    }
    throw err; // erro de rede sem response
  }
}
