// src/lib/security/csrf.ts
import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { getCookie, setCookie } from "@/utils/cookies";

/** Nomes padronizados (evita typos em usos externos) */
export const CSRF_COOKIE = "csrf_token" as const;
export const CSRF_HEADER = "X-CSRF-Token" as const;

/** Cookie não-HttpOnly onde guardamos o token CSRF. */
const CSRF_COOKIE_NAME = CSRF_COOKIE;
/** Header aceito pelo backend. */
const CSRF_HEADER_NAME = CSRF_HEADER;

/** Manda CSRF só em mutações. */
function mustSendCsrf(method?: string) {
  const m = (method || "GET").toUpperCase();
  return m !== "GET" && m !== "HEAD" && m !== "OPTIONS";
}

/** Lê o token corrente. */
export function getCsrfToken(): string | null {
  return getCookie(CSRF_COOKIE_NAME) || null;
}

/** Limpa o token CSRF (ex.: logout) */
export function clearCsrfToken() {
  // seu setCookie usa (name, value, days). -1 expira imediatamente
  setCookie(CSRF_COOKIE_NAME, "", -1);
}

/** Salva CSRF vindo em resposta Axios. */
export function captureCsrfFromAxiosResponse(res: AxiosResponse) {
  const t = (res.headers && (res.headers["x-csrf-token"] as string)) || "";
  if (t) setCookie(CSRF_COOKIE_NAME, t, 1);
}

/** Salva CSRF vindo em resposta fetch. */
export function captureCsrfFromFetchResponse(res: Response) {
  const t = res.headers.get("x-csrf-token");
  if (t) setCookie(CSRF_COOKIE_NAME, t, 1);
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
