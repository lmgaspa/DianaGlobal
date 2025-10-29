// src/lib/api.ts
"use client";

import axios from "axios";
import {
  captureCsrfFromAxiosResponse,
  captureCsrfFromFetchResponse,
  injectCsrfIntoFetchInit,
} from "@/lib/security/csrf";

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
  const res = await fetch(`${API_BASE}/api/auth/refresh-token`, {
    method: "POST",
    credentials: "include",
    // CSRF é injetado aqui pelo helper central (mantém OCP)
    ...injectCsrfIntoFetchInit({}),
  });

  // captura CSRF do header de resposta
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

/** Axios instance com interceptor de auth + auto refresh */
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

// capturar CSRF de qualquer resposta
api.interceptors.response.use((r) => {
  captureCsrfFromAxiosResponse(r);
  return r;
});

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

      // espera concluir e reexecuta
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

// === Confirm e-mail resend (throttled) ===============================

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

export async function confirmResend(email: string): Promise<ConfirmResendResult> {
  const body = { email: (email ?? "").trim().toLowerCase() };
  try {
    const res = await api.post("/api/auth/confirm/resend", body);
    // captura CSRF (se backend enviar aqui também)
    captureCsrfFromAxiosResponse(res);
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
