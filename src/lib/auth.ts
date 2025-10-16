// src/lib/auth.ts

// ===== Strategy =====
// - Access token: only in memory (short-lived, 1–5 min)
// - Refresh token: HttpOnly cookie set/rotated by backend (/api/auth/login, /api/auth/refresh)
// - CSRF: double-submit => cookie "XSRF-TOKEN" + header "X-XSRF-TOKEN"
// - CORS: fetch with credentials: 'include' for auth routes

let ACCESS_TOKEN: string | null = null;

// --- XSRF helpers ---
export function getXsrfCookie(): string {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : "";
}

// --- Access token memory API ---
export function setAccessToken(token: string | null) {
  ACCESS_TOKEN = token;
}

export function getAccessToken(): string | null {
  return ACCESS_TOKEN;
}

export function isAuthenticated(): boolean {
  return Boolean(ACCESS_TOKEN);
}

// --- Auth flows ---
// Backend endpoints esperados:
// POST /api/auth/login    -> body: { email, password } ; returns { accessToken }; sets HttpOnly cookie "refresh_token"
// POST /api/auth/refresh  -> header: X-XSRF-TOKEN; returns { accessToken }; rotates HttpOnly cookie
// POST /api/auth/logout   -> clears "refresh_token" cookie

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://dianagloballoginregister-52599bd07634.herokuapp.com";

// Login: salva access em memória. Refresh vem via cookie HttpOnly.
export async function login(email: string, password: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    credentials: "include", // necessário para receber o cookie HttpOnly do refresh
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const msg = await safeMessage(res);
    throw new Error(msg || `Login failed (${res.status})`);
  }
  const data = await res.json();
  setAccessToken(data?.accessToken || null);
}

// Tenta renovar usando cookie HttpOnly + XSRF
export async function refresh(): Promise<void> {
  const xsrf = getXsrfCookie();
  const res = await fetch(`${API_BASE}/api/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: { "X-XSRF-TOKEN": xsrf },
  });
  if (!res.ok) {
    setAccessToken(null);
    const msg = await safeMessage(res);
    throw new Error(msg || `Refresh failed (${res.status})`);
  }
  const data = await res.json();
  setAccessToken(data?.accessToken || null);
}

// Logout: backend apaga cookie; front zera access em memória
export async function logout(): Promise<void> {
  try {
    await fetch(`${API_BASE}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } finally {
    setAccessToken(null);
  }
}

// Chamada autenticada: injeta Bearer e tenta 1x o refresh em 401
export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const token = getAccessToken();
  const headers = new Headers(init.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let res = await fetch(input, { ...init, headers, credentials: "include" });

  if (res.status === 401) {
    // tenta refresh 1x
    try {
      await refresh();
      const newToken = getAccessToken();
      const retryHeaders = new Headers(init.headers || {});
      if (newToken) retryHeaders.set("Authorization", `Bearer ${newToken}`);
      res = await fetch(input, { ...init, headers: retryHeaders, credentials: "include" });
    } catch {
      // queda para 401 original
    }
  }
  return res;
}

// --- Util ---
async function safeMessage(res: Response): Promise<string | null> {
  try {
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const j = await res.json();
      return j?.message || j?.detail || null;
    }
    const t = await res.text();
    return t || null;
  } catch {
    return null;
  }
}
