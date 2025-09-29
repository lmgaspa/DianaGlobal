// src/lib/auth.ts
export const ACCESS_KEY = "access_token";
export const REFRESH_KEY = "refresh_token";

export function isAuthenticated(): boolean {
  try {
    const token = localStorage.getItem(ACCESS_KEY);
    return Boolean(token);
  } catch {
    return false;
  }
}
