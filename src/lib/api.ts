// src/lib/api.ts
"use client";

import axios from "axios";
import {
  captureCsrfFromAxiosResponse,
  captureCsrfFromFetchResponse,
  injectCsrfIntoFetchInit,
} from "@/lib/security/csrf";

/** Base da API (fallback para o Heroku) */
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://dianagloballoginregister-52599bd07634.herokuapp.com";

/* ------------------------------------------------------------------ */
/* Access token em memória                                             */
/* ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------ */
/* Refresh com fetch (CSRF centralizado)                               */
/* ------------------------------------------------------------------ */
export async function doRefresh(): Promise<string> {
  const res = await fetch(`${API_BASE}/api/v1/auth/refresh-token`, {
    method: "POST",
    credentials: "include",
    ...injectCsrfIntoFetchInit({}),
  });

  captureCsrfFromFetchResponse(res);

  if (!res.ok) {
    clearAccessToken();
    throw new Error(`refresh_failed_${res.status}`);
  }

  const data = await res.json();
  const newAccess = data?.token || data?.accessToken || data?.jwt || data?.access || "";
  if (!newAccess) {
    clearAccessToken();
    throw new Error("refresh_bad_payload");
  }

  setAccessToken(newAccess);
  return newAccess;
}

/* ------------------------------------------------------------------ */
/* Axios com Authorization + captura de CSRF                            */
/* ------------------------------------------------------------------ */
export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const t = getAccessToken();
  if (t) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${t}`;
  }
  return config;
});

api.interceptors.response.use((r) => {
  captureCsrfFromAxiosResponse(r);
  return r;
});

/* ------------------------------------------------------------------ */
/* Auto-refresh com fila                                               */
/* ------------------------------------------------------------------ */
let refreshing = false;
let pendingQueue: Array<() => void> = [];

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config as any;
    const status = error?.response?.status;

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

/* ------------------------------------------------------------------ */
/* Exemplos de chamadas específicas                                    */
/* ------------------------------------------------------------------ */

export type ConfirmResendPayload = {
  status?: "CONFIRMATION_EMAIL_SENT" | "ALREADY_CONFIRMED";
  error?: "TOO_MANY_REQUESTS" | string;
  message?: string;
  canResend?: boolean;
  cooldownSecondsRemaining?: number;
  attemptsToday?: number;
  maxPerDay?: number;
  nextAllowedAt?: string;
};

export interface ConfirmResendResult {
  ok: boolean;
  status: number;
  data: ConfirmResendPayload;
}

/** Reenvio do e-mail de confirmação com cooldown (lida com 429). */
export async function confirmResend(email: string): Promise<ConfirmResendResult> {
  const body = { email: (email ?? "").trim().toLowerCase() };
  try {
    const res = await api.post("/api/v1/auth/confirm/resend", body);
    captureCsrfFromAxiosResponse(res); // caso backend envie CSRF também aqui
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
    throw err;
  }
}

/** Priming do access a partir de uma session (ex.: NextAuth) */
export function primeAccessFromNextAuth(session: any) {
  const t =
    session?.accessToken || session?.jwt || session?.access || session?.token;
  if (typeof t === "string" && t) setAccessToken(t);
}
