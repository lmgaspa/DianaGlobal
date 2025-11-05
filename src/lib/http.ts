// src/lib/http.ts
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import {
  captureCsrfFromAxiosResponse,
  getCsrfToken,
  injectCsrfIntoAxiosRequest,
  clearCsrfToken,
} from "@/lib/security/csrf";

/** Base da API (fallback para o Heroku) */
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  "https://dianagloballoginregister-52599bd07634.herokuapp.com";

/* ------------------------------------------------------------------ */
/* Access token em memória (não usar localStorage por segurança)      */
/* ------------------------------------------------------------------ */
let inMemoryAccessToken: string | null = null;

export function setAccessToken(token: string | null) {
  inMemoryAccessToken = token;
}
export function getAccessToken(): string | null {
  return inMemoryAccessToken;
}

/* ------------------------------------------------------------------ */
/* Cliente público (sem Authorization)                                 */
/* ------------------------------------------------------------------ */
export const apiPublic: AxiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

/* ------------------------------------------------------------------ */
/* Cliente autenticado (Authorization + CSRF por interceptors)         */
/* ------------------------------------------------------------------ */
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

/** Injeta Authorization + CSRF de forma centralizada (OCP) */
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const access = getAccessToken();
  if (access) {
    config.headers = config.headers || {};
    (config.headers as any).Authorization = `Bearer ${access}`;
  }
  return injectCsrfIntoAxiosRequest(config);
});

/** Captura CSRF de qualquer resposta (OCP) */
api.interceptors.response.use((res) => {
  captureCsrfFromAxiosResponse(res);
  return res;
});

/* ------------------------------------------------------------------ */
/* Auto-refresh com fila (evita thundering herd)                       */
/* ------------------------------------------------------------------ */
let isRefreshing = false;
let pendingQueue: {
  resolve: (token: string) => void;
  reject: (err: any) => void;
  originalRequest: AxiosRequestConfig;
}[] = [];

async function doRefresh(): Promise<string> {
  // Validação: não tenta refresh em páginas públicas ou sem cookie
  const { shouldAttemptRefresh } = await import("@/utils/refreshValidation");
  if (!shouldAttemptRefresh()) {
    throw new Error("refresh_not_allowed");
  }

  const csrf = getCsrfToken() || "";
  const res = await axios.post(
    `${API_BASE}/api/v1/auth/refresh-token`,
    {},
    { withCredentials: true, headers: { "X-CSRF-Token": csrf } }
  );
  captureCsrfFromAxiosResponse(res);
  const newAccess = res.data?.token || res.data?.access || res.data?.jwt || null;
  if (!newAccess) throw new Error("Bad refresh payload");
  return newAccess as string;
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (!error.response || error.response.status !== 401) throw error;
    if (originalRequest._retry) throw error;
    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: (token: string) => {
            originalRequest.headers = originalRequest.headers || {};
            (originalRequest.headers as any).Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          },
          reject,
          originalRequest,
        });
      });
    }

    isRefreshing = true;
    try {
      const newAccess = await doRefresh();
      setAccessToken(newAccess);
      pendingQueue.forEach(({ resolve }) => resolve(newAccess));
      pendingQueue = [];

      originalRequest.headers = originalRequest.headers || {};
      (originalRequest.headers as any).Authorization = `Bearer ${newAccess}`;
      return api(originalRequest);
    } catch (err: any) {
      // Se o erro for "refresh_not_allowed", não tentar refresh novamente
      if (err?.message === "refresh_not_allowed") {
        setAccessToken(null);
        throw error; // Re-throw o erro original 401
      }
      pendingQueue.forEach(({ reject }) => reject(err));
      pendingQueue = [];
      setAccessToken(null);
      
      // Não redirecionar automaticamente aqui - deixar os componentes lidarem com isso
      // O useBackendProfile e PasswordRequiredGate vão verificar a sessão e decidir
      
      throw err;
    } finally {
      isRefreshing = false;
    }
  }
);

/* ------------------------------------------------------------------ */
/* Helpers de alto nível                                               */
/* ------------------------------------------------------------------ */

export async function login(email: string, password: string) {
  const res = await apiPublic.post(
    "/api/v1/auth/login",
    { email, password },
    { withCredentials: true }
  );
  // Caso o backend já envie CSRF aqui, captura:
  captureCsrfFromAxiosResponse(res);
  const access = (res.data?.token || res.data?.access || res.data?.jwt) as string | undefined;
  if (!access) throw new Error("Login did not return access token");
  setAccessToken(access);
  return res.data;
}

export async function logout() {
  try {
    await api.post("/api/v1/auth/logout"); // CSRF entra via interceptor
  } finally {
    setAccessToken(null);
    clearCsrfToken(); // limpa o cookie de CSRF no cliente
  }
}

export async function getProfile<T = any>() {
  const res = await api.get<T>("/api/v1/auth/profile");
  return res.data;
}

/** Priming do access a partir de uma session (ex.: NextAuth) */
export function primeAccessFromNextAuth(session: any) {
  const t = session?.accessToken as string | undefined;
  if (t) setAccessToken(t);
}
