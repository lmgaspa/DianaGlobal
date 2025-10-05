import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://dianagloballoginregister-52599bd07634.herokuapp.com";

// Access token apenas em memória
let ACCESS_TOKEN: string | null = null;
export const setAccessToken = (t: string | null) => { ACCESS_TOKEN = t; };
export const getAccessToken = () => ACCESS_TOKEN;

// XSRF helpers (double-submit)
export function getXsrfCookie(): string {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : "";
}

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { Accept: "application/json" },
});

// injeta Authorization se houver access
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];
const enqueue = (cb: (token: string | null) => void) => pendingQueue.push(cb);
const flushQueue = (newToken: string | null) => {
  pendingQueue.forEach((cb) => { try { cb(newToken); } catch {} });
  pendingQueue = [];
};

// login/logout/refresh
export async function login(email: string, password: string) {
  const res = await api.post("/api/auth/login", { email, password });
  const accessToken = (res.data && res.data.accessToken) || null;
  setAccessToken(accessToken);
  return accessToken;
}

export async function doRefresh(): Promise<string | null> {
  const xsrf = getXsrfCookie();
  const res = await api.post("/api/auth/refresh", {}, { headers: { "X-XSRF-TOKEN": xsrf } });
  const accessToken = (res.data && res.data.accessToken) || null;
  setAccessToken(accessToken);
  return accessToken;
}

export async function logout() {
  try { await api.post("/api/auth/logout"); } finally { setAccessToken(null); }
}

// 401 -> tenta refresh e repete a request
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          enqueue((newToken) => {
            if (newToken) {
              original.headers = original.headers ?? {};
              (original.headers as any).Authorization = `Bearer ${newToken}`;
              resolve(api(original));
            } else {
              reject(error);
            }
          });
        });
      }

      isRefreshing = true;
      try {
        const newToken = await doRefresh();
        flushQueue(newToken);
        if (newToken) {
          original.headers = original.headers ?? {};
          (original.headers as any).Authorization = `Bearer ${newToken}`;
        }
        return api(original);
      } catch (err) {
        setAccessToken(null);
        flushQueue(null);
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// helpers
export const authGet  = <T=any>(url: string, cfg?: AxiosRequestConfig) => api.get<T>(url, cfg);
export const authPost = <T=any>(url: string, data?: any, cfg?: AxiosRequestConfig) => api.post<T>(url, data, cfg);
export const authPut  = <T=any>(url: string, data?: any, cfg?: AxiosRequestConfig) => api.put<T>(url, data, cfg);
export const authDel  = <T=any>(url: string, cfg?: AxiosRequestConfig) => api.delete<T>(url, cfg);
