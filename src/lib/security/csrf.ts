// src/lib/security/csrf.ts
import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { getCookie, setCookie } from "@/utils/cookies";

/** Nome do cookie não-HttpOnly onde guardamos o token CSRF. */
const CSRF_COOKIE_NAME = "csrf_token";
/** Nome do header aceito pelo backend. */
const CSRF_HEADER_NAME = "X-CSRF-Token";

/** Política para decidir quando injetar CSRF (mantém fechado p/ mutações). */
function mustSendCsrf(method?: string) {
  const m = (method || "GET").toUpperCase();
  return m !== "GET" && m !== "HEAD" && m !== "OPTIONS";
}

/** Lê o token corrente. */
export function getCsrfToken(): string | null {
  return getCookie(CSRF_COOKIE_NAME) || null;
}

/** Persiste token vindo do backend (response header). */
export function captureCsrfFromAxiosResponse(res: AxiosResponse) {
  const t = (res.headers && (res.headers["x-csrf-token"] as string)) || "";
  if (t) {
    setCookie(CSRF_COOKIE_NAME, t, 1);
  }
}

/** Persiste token vindo de fetch Response. */
export function captureCsrfFromFetchResponse(res: Response) {
  const t = res.headers.get("x-csrf-token");
  if (t) {
    setCookie(CSRF_COOKIE_NAME, t, 1);
  }
}

/** Injeta header CSRF num request Axios mutável. */
export function injectCsrfIntoAxiosRequest<T = any>(config: InternalAxiosRequestConfig<T>) {
  if (mustSendCsrf(config.method)) {
    const csrf = getCsrfToken();
    if (csrf) {
      config.headers = config.headers || {};
      (config.headers as any)[CSRF_HEADER_NAME] = csrf;
    }
  }
  return config;
}

/** Injeta header CSRF em um fetch mutável. */
export function injectCsrfIntoFetchInit(init: RequestInit = {}): RequestInit {
  const method = (init.method || "GET").toUpperCase();
  if (!mustSendCsrf(method)) return init;

  const csrf = getCsrfToken();
  if (!csrf) return init;

  const headers = new Headers(init.headers || {});
  if (!headers.has(CSRF_HEADER_NAME)) headers.set(CSRF_HEADER_NAME, csrf);
  return { ...init, headers };
}
