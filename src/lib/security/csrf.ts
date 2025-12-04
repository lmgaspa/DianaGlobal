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

/** Salva CSRF vindo em resposta Axios. 
 * O backend pode enviar o token CSRF no header ou no cookie.
 * Se vier no header, salva no cookie para uso futuro.
 * O cookie é setado automaticamente pelo browser quando o backend envia Set-Cookie.
 */
export function captureCsrfFromAxiosResponse(res: AxiosResponse) {
  // Tentar capturar do header (se backend enviar explicitamente)
  const headerToken = (res.headers && (res.headers["x-csrf-token"] as string)) || "";
  if (headerToken) {
    setCookie(CSRF_COOKIE_NAME, headerToken, 1);
    return;
  }
  // Se não veio no header, o cookie já foi setado automaticamente pelo browser
  // Não precisamos fazer nada - o getCsrfToken() já lê do cookie
}

/** Salva CSRF vindo em resposta fetch.
 * O backend pode enviar o token CSRF no header ou no cookie.
 * Se vier no header, salva no cookie para uso futuro.
 * O cookie é setado automaticamente pelo browser quando o backend envia Set-Cookie.
 */
export function captureCsrfFromFetchResponse(res: Response) {
  // Tentar capturar do header (se backend enviar explicitamente)
  const headerToken = res.headers.get("x-csrf-token");
  if (headerToken) {
    setCookie(CSRF_COOKIE_NAME, headerToken, 1);
    return;
  }
  // Se não veio no header, o cookie já foi setado automaticamente pelo browser
  // Não precisamos fazer nada - o getCsrfToken() já lê do cookie
}

/** Injeta CSRF no request Axios (somente mutações). */
export function injectCsrfIntoAxiosRequest<T = unknown>(config: InternalAxiosRequestConfig<T>) {
  if (mustSendCsrf(config.method)) {
    const csrf = getCsrfToken();
    if (csrf) {
      config.headers = config.headers || {};
      if (typeof config.headers === 'object' && !Array.isArray(config.headers)) {
        (config.headers as Record<string, string>)[CSRF_HEADER_NAME] = csrf;
      }
      console.log(`[CSRF] ✅ Adding X-CSRF-Token header to ${config.method?.toUpperCase()} ${config.url}`);
    } else {
      console.warn(`[CSRF] ❌ NO CSRF TOKEN for ${config.method?.toUpperCase()} ${config.url}`);
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
