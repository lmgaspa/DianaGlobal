// src/lib/api.ts
"use client";

import axios, { AxiosRequestConfig, AxiosError } from "axios";
import {
  captureCsrfFromAxiosResponse,
  captureCsrfFromFetchResponse,
  injectCsrfIntoFetchInit,
  injectCsrfIntoAxiosRequest,
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
  // Validação: não tenta refresh em páginas públicas ou sem cookie
  const { shouldAttemptRefresh } = await import("@/utils/refreshValidation");
  if (!shouldAttemptRefresh()) {
    clearAccessToken();
    throw new Error("refresh_not_allowed");
  }

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
  if (t && config.headers) {
    config.headers = config.headers ?? {};
    if (typeof config.headers === 'object' && !Array.isArray(config.headers)) {
      (config.headers as Record<string, string>).Authorization = `Bearer ${t}`;
    }
  }
  // Injeta CSRF token em requisições POST/PUT/DELETE
  return injectCsrfIntoAxiosRequest(config);
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

interface AxiosRequestConfigWithRetry extends AxiosRequestConfig {
  _retry?: boolean;
}

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as AxiosRequestConfigWithRetry | undefined;
    const status = error?.response?.status;

    if (status === 401 && original && !original._retry) {
      if (!refreshing) {
        refreshing = true;
        try {
          await doRefresh();
          refreshing = false;
          pendingQueue.forEach((resume) => resume());
          pendingQueue = [];
        } catch (e: unknown) {
          refreshing = false;
          pendingQueue = [];
          const err = e as { message?: string };
          // Se o erro for "refresh_not_allowed", rejeitar com erro original
          if (err?.message === "refresh_not_allowed") {
            return Promise.reject(error);
          }
          return Promise.reject(error);
        }
      }

      return new Promise((resolve) => {
        pendingQueue.push(async () => {
          if (original) {
            original._retry = true;
            const t = getAccessToken();
            original.headers = original.headers ?? {};
            if (t && typeof original.headers === 'object' && !Array.isArray(original.headers)) {
              (original.headers as Record<string, string>).Authorization = `Bearer ${t}`;
            }
            resolve(api(original));
          }
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
  } catch (err: unknown) {
    const axiosError = err as { response?: { status?: number; data?: ConfirmResendPayload } };
    const res = axiosError?.response;
    if (res && res.status !== undefined) {
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
export function primeAccessFromNextAuth(session: { accessToken?: string; jwt?: string; access?: string; token?: string } | null | undefined) {
  const t =
    session?.accessToken || session?.jwt || session?.access || session?.token;
  if (typeof t === "string" && t) setAccessToken(t);
}
