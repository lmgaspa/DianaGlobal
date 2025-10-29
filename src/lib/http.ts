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
} from "@/lib/security/csrf";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  "https://dianagloballoginregister-52599bd07634.herokuapp.com";

// ---------- access em memória (não em localStorage) ----------
let inMemoryAccessToken: string | null = null;
export function setAccessToken(token: string | null) {
  inMemoryAccessToken = token;
}
export function getAccessToken(): string | null {
  return inMemoryAccessToken;
}

// ---------- cliente público (sem interceptors, sem Authorization) ----------
export const apiPublic: AxiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

// ---------- cliente autenticado (com interceptors) ----------
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

// Authorization (access) + CSRF (mutações) no request
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // auth
  const access = getAccessToken();
  if (access) {
    config.headers = config.headers || {};
    (config.headers as any).Authorization = `Bearer ${access}`;
  }
  // csrf centralizado (OCP)
  return injectCsrfIntoAxiosRequest(config);
});

// Captura CSRF de QUALQUER resposta do backend
api.interceptors.response.use((res) => {
  captureCsrfFromAxiosResponse(res);
  return res;
});

// refresh 401 c/ fila
let isRefreshing = false;
let pendingQueue: {
  resolve: (token: string) => void;
  reject: (err: any) => void;
  originalRequest: AxiosRequestConfig;
}[] = [];

async function doRefresh(): Promise<string> {
  const csrf = getCsrfToken() || "";
  const res = await axios.post(
    `${API_BASE}/api/auth/refresh-token`,
    {},
    { withCredentials: true, headers: { "X-CSRF-Token": csrf } }
  );
  // captura CSRF do refresh também
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

// ---------- helpers ----------
export async function login(email: string, password: string) {
  const res = await apiPublic.post("/api/auth/login", { email, password }, { withCredentials: true });
  // captura CSRF, caso o backend já mande no login
  captureCsrfFromAxiosResponse(res);
  const access = (res.data?.token || res.data?.access || res.data?.jwt) as string | undefined;
  if (!access) throw new Error("Login did not return access token");
  setAccessToken(access);
  return res.data;
}

export async function logout() {
  try {
    await api.post("/api/auth/logout"); // CSRF já entra via interceptor
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
