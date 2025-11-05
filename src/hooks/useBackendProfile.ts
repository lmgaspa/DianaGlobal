"use client";

import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/http";
import { useSession } from "next-auth/react";

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
  const { status: sessionStatus } = useSession();
  const retryCountRef = useRef(0);
  const maxRetries = 3;

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
      // Se receber 401, apenas definir erro - não redirecionar automaticamente
      // Deixar os componentes (PasswordRequiredGate, dashboard, etc) decidirem o que fazer
      if (e?.response?.status === 401) {
        setErr("Unauthorized. Please sign in again.");
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
    retryCountRef.current = 0;

    const tryFetch = async () => {
      setLoading(true);
      setErr(null);
      const prof = await fetchProfile();
      if (!alive) return;
      
      if (prof) {
        setProfile(prof);
        setLoading(false);
        retryCountRef.current = 0; // Reset retry count on success
      } else {
        // Se não conseguiu carregar profile, verificar se deve tentar novamente
        setLoading(false);
        // O retry será feito pelo erro sendo setado no fetchProfile
      }
    };

    tryFetch();

    return () => {
      alive = false;
    };
  }, [sessionStatus]);

  // Retry quando houver erro 401 com sessão válida
  useEffect(() => {
    if (!error || !error.includes("Unauthorized") || sessionStatus !== "authenticated") return;
    if (profile) return; // Já tem profile, não precisa retry
    if (retryCountRef.current >= maxRetries) return; // Já tentou demais
    
    const timer = setTimeout(() => {
      retryCountRef.current++;
      reload();
    }, 2000 * retryCountRef.current);
    
    return () => clearTimeout(timer);
  }, [error, sessionStatus, profile]);

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
