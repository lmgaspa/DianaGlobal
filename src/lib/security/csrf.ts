// src/lib/security/csrf.ts
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { getCookie, setCookie } from "@/utils/cookies";

/** Config extensível: aberto para extensão, fechado para modificação (OCP) */
export type CsrfConfig = {
  cookieName: string;   // cookie NÃO-HttpOnly com o token
  headerName: string;   // header aceito pelo backend
  persistDays: number;  // dias para manter (ok ser 1 dia/sessão curta)
};

const _cfg: CsrfConfig = {
  cookieName: "csrf_token",
  headerName: "X-CSRF-Token",
  persistDays: 1,
};

export function configureCsrf(partial: Partial<CsrfConfig>) {
  if (!partial) return;
  if (partial.cookieName) _cfg.cookieName = partial.cookieName;
  if (partial.headerName) _cfg.headerName = partial.headerName;
  if (typeof partial.persistDays === "number") _cfg.persistDays = partial.persistDays;
}

export function getCsrfConfig(): Readonly<CsrfConfig> {
  return _cfg;
}

/** Helpers básicos */
function isMutation(method?: string) {
  const m = (method || "GET").toUpperCase();
  return m === "POST" || m === "PUT" || m === "PATCH" || m === "DELETE";
}

export function getCsrfToken(): string | null {
  return getCookie(_cfg.cookieName) || null;
}

export function clearCsrfToken() {
  setCookie(_cfg.cookieName, null, 0);
}

/** ---------- Axios ---------- */

export function captureCsrfFromAxiosResponse(res: AxiosResponse) {
  const h = (res.headers || {}) as Record<string, string | string[] | undefined>;

  // nomes normalizados (lowercase)
  const desired = _cfg.headerName.toLowerCase();

  // tenta chaves mais comuns primeiro
  let t =
    (h["x-csrf-token"] as string | undefined) ??
    (h[desired] as string | undefined);

  // fallback: varre case-insensitive
  if (!t) {
    for (const [k, v] of Object.entries(h)) {
      if ((k || "").toLowerCase() === desired) {
        t = Array.isArray(v) ? (v[0] as string) : (v as string | undefined);
        break;
      }
    }
  }

  if (t) setCookie(_cfg.cookieName, t, _cfg.persistDays);
}

export function injectCsrfIntoAxiosRequest<T = any>(config: InternalAxiosRequestConfig<T>) {
  if (!isMutation(config.method)) return config;
  const token = getCsrfToken();
  if (!token) return config;

  config.headers = config.headers || {};
  const headers = config.headers as Record<string, any>;
  if (!headers[_cfg.headerName]) headers[_cfg.headerName] = token; // idempotente

  return config;
}

/** Conecta request/response de CSRF em um AxiosInstance */
export function wireAxiosCsrf(instance: AxiosInstance) {
  instance.interceptors.request.use(injectCsrfIntoAxiosRequest);
  instance.interceptors.response.use((res) => {
    captureCsrfFromAxiosResponse(res);
    return res;
  });
}

/** ---------- fetch ---------- */

export function captureCsrfFromFetchResponse(res: Response) {
  const t = res.headers.get("x-csrf-token") || res.headers.get(_cfg.headerName);
  if (t) setCookie(_cfg.cookieName, t, _cfg.persistDays);
}

export function injectCsrfIntoFetchInit(init: RequestInit = {}): RequestInit {
  const method = (init.method || "GET").toUpperCase();
  if (!isMutation(method)) return init;

  const token = getCsrfToken();
  if (!token) return init;

  const headers = new Headers(init.headers || {});
  if (!headers.has(_cfg.headerName)) headers.set(_cfg.headerName, token);

  return { ...init, headers };
}

/** Wrapper de fetch com CSRF embutido + captura automática (opcional) */
export async function csrfFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const req = injectCsrfIntoFetchInit(init);
  const res = await fetch(input, req);
  captureCsrfFromFetchResponse(res);
  return res;
}
