/**
 * Utilitário para validar se deve tentar fazer refresh token
 * Evita requisições desnecessárias em páginas públicas
 */

/**
 * Lista de páginas públicas onde refresh não deve ser tentado
 */
const PUBLIC_PAGES = [
  "/login",
  "/signup",
  "/register",
  "/forgot-password",
  "/check-email",
  "/reset-password",
  "/confirm-account",
  "/set-password",
  "/verify-email",
  "/email-change/confirm",
  "/register-sucess",
  "/disclosures",
  "/privacy-policy",
  "/terms-service",
  "/cookies",
];

/**
 * Verifica se a página atual é uma página pública
 */
function isPublicPage(): boolean {
  if (typeof window === "undefined") return false;
  const currentPath = window.location.pathname;
  return PUBLIC_PAGES.some(
    (path) => currentPath === path || currentPath.startsWith(path + "/")
  );
}

/**
 * Verifica se deve tentar fazer refresh token
 * 
 * NOTA: Como refresh_token é HttpOnly, não podemos verificar se existe no frontend.
 * Esta função foca em evitar refresh em páginas públicas, que é o principal objetivo.
 * O backend sempre valida o cookie no servidor (defensivo).
 * 
 * @returns true se deve tentar refresh, false caso contrário
 */
export function shouldAttemptRefresh(): boolean {
  // Não tenta refresh em páginas públicas
  // Isso evita requisições desnecessárias e erros 403/401 no console
  if (isPublicPage()) {
    return false;
  }

  // Em páginas protegidas, tenta refresh normalmente
  // O backend validará se o cookie existe e é válido
  return true;
}

/**
 * Verifica se está em uma página pública específica
 * Útil para casos especiais
 */
export function isPublicRoute(path?: string): boolean {
  const route = path || (typeof window !== "undefined" ? window.location.pathname : "");
  return PUBLIC_PAGES.some(
    (publicPath) => route === publicPath || route.startsWith(publicPath + "/")
  );
}

