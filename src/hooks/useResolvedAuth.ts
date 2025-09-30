// src/hooks/useResolvedAuth.ts
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession, signOut } from "next-auth/react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://dianagloballoginregister-52599bd07634.herokuapp.com";

type Profile = { id: string; name: string | null; email: string };

function getLS(key: string) { try { return localStorage.getItem(key) ?? undefined; } catch { return undefined; } }
function setLS(key: string, val: string) { try { localStorage.setItem(key, val); } catch {} }
function delLS(key: string) { try { localStorage.removeItem(key); } catch {} }

export function useResolvedAuth() {
  const { data: session, status } = useSession();

  const sessionAccess = useMemo(
    () => (session as any)?.accessToken as string | undefined,
    [session]
  );
  const sessionRefresh = useMemo(
    () => (session as any)?.refreshToken as string | undefined,
    [session]
  );

  const lsAccess  = typeof window !== "undefined" ? getLS("access_token")  : undefined;
  const lsRefresh = typeof window !== "undefined" ? getLS("refresh_token") : undefined;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    const tryFetchProfile = async (token: string) => {
      const res = await fetch(`${API_BASE}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw Object.assign(new Error(`${res.status}`), { status: res.status });
      return (await res.json()) as Profile;
    };

    const tryRefresh = async (refreshToken: string) => {
      const r = await fetch(`${API_BASE}/api/auth/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (!r.ok) throw new Error("refresh_failed");
      const j = await r.json(); // { token: "..." } no seu backend (JwtResponse)
      const newAccess = j?.token || j?.accessToken || j?.jwt || null;
      if (!newAccess) throw new Error("refresh_bad_payload");
      setLS("access_token", newAccess);
      return newAccess as string;
    };

    (async () => {
      setLoading(true);
      setError(null);

      // 1) tenta com access token (prioriza NextAuth)
      let access = sessionAccess || lsAccess;

      try {
        if (!access) {
          // 2) tenta refresh
          const refresh = sessionRefresh || lsRefresh;
          if (!refresh) throw new Error("no_tokens");
          access = await tryRefresh(refresh);
        }

        const prof = await tryFetchProfile(access);
        setProfile(prof);

        // sincroniza localStorage para os hooks existentes
        setLS("userId", prof.id);
        if (prof.name) setLS("name", prof.name);
      } catch (e: any) {
        // expirado / refresh falhou → limpa e pede login
        if (e?.status === 401) {
          delLS("access_token");
        }
        setError("Session expired. Please sign in again.");
        setProfile(null);
        try { await signOut({ redirect: false }); } catch {}
      } finally {
        setLoading(false);
      }
    })();
  }, [status, sessionAccess, sessionRefresh]);

  return { profile, loading, error };
}
