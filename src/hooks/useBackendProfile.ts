"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/http";
import { signOut } from "next-auth/react";

export type Profile = {
  id: string;
  name: string | null;
  email: string;
  authProvider?: string;   // "GOOGLE" | "LOCAL" etc.
  passwordSet?: boolean;   // true se o usuário já definiu senha local
};

export function useBackendProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setErr] = useState<string | null>(null);

  const fetchProfile = async (): Promise<Profile | null> => {
    try {
      // Usa o axios `api` que tem interceptors de refresh automático
      const res = await api.get<{
        id: string;
        name: string | null;
        email: string;
        auth_provider?: string;
        password_set?: boolean;
      }>("/api/v1/auth/profile");

      // Mapear campos do backend (snake_case) para o formato esperado pelo frontend (camelCase)
      const mappedProfile: Profile = {
        id: res.data.id,
        name: res.data.name,
        email: res.data.email,
        authProvider: res.data.auth_provider,
        passwordSet: res.data.password_set,
      };
      return mappedProfile;
    } catch (e: any) {
      // Se receber 401 após tentar refresh (sem cookie válido), redireciona para login
      if (e?.response?.status === 401) {
        setErr("Unauthorized. Please sign in again.");
        // Limpar sessão e redirecionar
        try {
          await signOut({ redirect: false });
        } catch {}
        // Redirecionar para login usando window.location (funciona em hooks)
        if (typeof window !== "undefined") {
          setTimeout(() => {
            window.location.href = "/login";
          }, 100);
        }
        return null;
      }

      // Outros erros
      const msg = e?.response?.data?.message || 
                  e?.response?.data?.detail || 
                  e?.message || 
                  "Network error while loading profile";
      setErr(msg);
      return null;
    }
  };

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setErr(null);
      const prof = await fetchProfile();
      if (!alive) return;
      if (prof) {
        setProfile(prof);
      }
      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, []);

  // Função para recarregar o perfil manualmente
  const reload = async () => {
    setLoading(true);
    setErr(null);
    const prof = await fetchProfile();
    if (prof) {
      setProfile(prof);
    }
    setLoading(false);
    return prof;
  };

  return { profile, loading, error, reload };
}
