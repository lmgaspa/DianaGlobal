// src/lib/security/csrf.ts
import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { getCookie, setCookie } from "@/utils/cookies";

/** Cookie não-HttpOnly onde guardamos o token CSRF. */
const CSRF_COOKIE_NAME = "csrf_token";
/** Header aceito pelo backend. */
const CSRF_HEADER_NAME = "X-CSRF-Token";

/** Manda CSRF só em mutações. */
function mustSendCsrf(method?: string) {
  const m = (method || "GET").toUpperCase();
  return m !== "GET" && m !== "HEAD" && m !== "OPTIONS";
}

/** Lê o token corrente. */
export function getCsrfToken(): string | null {
  return getCookie(CSRF_COOKIE_NAME) || null;
}

/** Salva CSRF vindo em resposta Axios. */
export function captureCsrfFromAxiosResponse(res: AxiosResponse) {
  const t = (res.headers && (res.headers["x-csrf-token"] as string)) || "";
  if (t) {
    // seu setCookie aceita (name, value, days:number)
    setCookie(CSRF_COOKIE_NAME, t, 1);
  }
}

/** Salva CSRF vindo em resposta fetch. */
export function captureCsrfFromFetchResponse(res: Response) {
  const t = res.headers.get("x-csrf-token");
  if (t) {
    setCookie(CSRF_COOKIE_NAME, t, 1);
  }
}

/** Injeta CSRF no request Axios (somente mutações). */
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

/** Injeta CSRF no init do fetch (somente mutações). */
export function injectCsrfIntoFetchInit(init: RequestInit = {}): RequestInit {
  const method = (init.method || "GET").toUpperCase();
  if (!mustSendCsrf(method)) return init;

  const csrf = getCsrfToken();
  if (!csrf) return init;

  const headers = new Headers(init.headers || {});
  if (!headers.has(CSRF_HEADER_NAME)) headers.set(CSRF_HEADER_NAME, csrf);
  return { ...init, headers };
}
