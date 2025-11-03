// src/hooks/useResolvedAuth.ts
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { api, getAccessToken, setAccessToken } from "@/lib/api";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://dianagloballoginregister-52599bd07634.herokuapp.com";

type Profile = { id: string; name: string | null; email: string };

export function useResolvedAuth() {
  const { data: session, status } = useSession();

  // Se o NextAuth trouxer um accessToken (ex.: após login provider),
  // nós o adotamos e guardamos em memória para o Axios interceptor usar.
  const sessionAccess = useMemo(
    () => (session as any)?.accessToken as string | undefined,
    [session]
  );

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  // Se o NextAuth tiver um access token novo, registra em memória
  useEffect(() => {
    if (sessionAccess) {
      setAccessToken(sessionAccess);
    }
  }, [sessionAccess]);

  const fetchProfile = useCallback(async () => {
    // Usa o Axios `api` com interceptors:
    // - injeta Authorization se houver access em memória
    // - em 401, tenta refresh automaticamente (cookie HttpOnly + CSRF)
    const { data } = await api.get<Profile>("/api/v1/auth/profile");
    return data;
  }, []);

  useEffect(() => {
    if (status === "loading") return;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        // Se ainda não houver access em memória e não veio via session,
        // a primeira chamada pode cair em 401, e o interceptor fará o refresh.
        const current = getAccessToken();
        if (!current && !sessionAccess) {
          // tudo bem — segue para a request que acionará o refresh se existir cookie válido
        }

        const prof = await fetchProfile();
        setProfile(prof);
      } catch (e: any) {
        // Se cair aqui, refresh falhou ou usuário não está mais autenticado
        setProfile(null);
        setError("Session expired. Please sign in again.");
        try { await signOut({ redirect: false }); } catch {}
      } finally {
        setLoading(false);
      }
    })();
  }, [status, sessionAccess, fetchProfile]);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const prof = await fetchProfile();
      setProfile(prof);
    } catch {
      setProfile(null);
      setError("Session expired. Please sign in again.");
      try { await signOut({ redirect: false }); } catch {}
    } finally {
      setLoading(false);
    }
  }, [fetchProfile]);

  return { profile, loading, error, reload };
}
