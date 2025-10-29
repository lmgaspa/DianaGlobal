// src/lib/http.ts
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import {
  csrfFetch,
  getCsrfToken,
  wireAxiosCsrf,
  captureCsrfFromAxiosResponse,
} from "@/lib/security/csrf";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  "https://dianagloballoginregister-52599bd07634.herokuapp.com";

/* ================= Access Token em memória ================= */
let inMemoryAccessToken: string | null = null;

export function setAccessToken(token: string | null) {
  inMemoryAccessToken = token;
}
export function getAccessToken(): string | null {
  return inMemoryAccessToken;
}

/* ================= Axios instances ================= */
export const apiPublic: AxiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

/* ======== Só Autorização aqui (SRP); CSRF vem do wireAxiosCsrf ======== */
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const access = getAccessToken();
  if (access) {
    config.headers = config.headers || {};
    (config.headers as any).Authorization = `Bearer ${access}`;
  }
  return config;
});

/* ======== Pluga CSRF (OCP) ======== */
wireAxiosCsrf(api);

/* ================= Refresh 401 com fila ================= */
let isRefreshing = false;
let pendingQueue: {
  resolve: (token: string) => void;
  reject: (err: any) => void;
  originalRequest: AxiosRequestConfig & { _retry?: boolean };
}[] = [];

/** Usa fetch com CSRF centralizado; não depende do axios nem do Authorization */
async function doRefresh(): Promise<string> {
  const res = await csrfFetch(`${API_BASE}/api/auth/refresh-token`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) throw new Error(`refresh_failed_${res.status}`);

  const data = await res.json();
  const newAccess = data?.token || data?.access || data?.jwt || null;
  if (!newAccess) throw new Error("Bad refresh payload");

  return newAccess as string;
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = (error.config || {}) as AxiosRequestConfig & { _retry?: boolean };

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

      // Desbloqueia fila
      pendingQueue.forEach(({ resolve }) => resolve(newAccess));
      pendingQueue = [];

      // Reenvia o original com novo Authorization
      originalRequest.headers = originalRequest.headers || {};
      (originalRequest.headers as any).Authorization = `Bearer ${newAccess}`;
      return api(originalRequest);
    } catch (err) {
      pendingQueue.forEach(({ reject }) => reject(err));
      pendingQueue = [];
      setAccessToken(null);
      throw err;
    } finally {
      isRefreshing = false;
    }
  }
);

/* ================= Helpers de alto nível ================= */
export async function login(email: string, password: string) {
  const res = await apiPublic.post("/api/auth/login", { email, password }, { withCredentials: true });
  // Caso o backend já envie X-CSRF-Token no login
  captureCsrfFromAxiosResponse(res);

  const access = (res.data?.token || res.data?.access || res.data?.jwt) as string | undefined;
  if (!access) throw new Error("Login did not return access token");
  setAccessToken(access);
  return res.data;
}

export async function logout() {
  try {
    await api.post("/api/auth/logout"); // CSRF já entra via wireAxiosCsrf
  } finally {
    setAccessToken(null);
  }
}

export async function getProfile<T = any>() {
  const res = await api.get<T>("/api/auth/profile");
  return res.data;
}

export function primeAccessFromNextAuth(session: any) {
  const t = session?.accessToken as string | undefined;
  if (t) setAccessToken(t);
}
