"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { api, setAccessToken } from "@/lib/http";
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
  const { data: session, status: sessionStatus } = useSession();
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  // Sincronizar accessToken da sessão NextAuth com http.ts
  // Isso garante que após login (via signIn), o token seja usado imediatamente
  const sessionAccessToken = useMemo(
    () => (session as any)?.accessToken as string | undefined,
    [session]
  );

  useEffect(() => {
    if (sessionAccessToken) {
      console.log("[useBackendProfile] Syncing token from NextAuth session:", sessionAccessToken.substring(0, 20) + "...");
      setAccessToken(sessionAccessToken);
    } else {
      console.log("[useBackendProfile] No session token available");
    }
  }, [sessionAccessToken]);

  const fetchProfile = useCallback(async (): Promise<Profile | null> => {
    // Garantir que o token está sincronizado antes de fazer a requisição
    if (sessionAccessToken) {
      setAccessToken(sessionAccessToken);
    }
    try {
      // Usa o axios `api` que tem interceptors de refresh automático
      const res = await api.get<{
        id: string;
        name: string | null;
        email: string;
        // Backend pode retornar camelCase ou snake_case
        authProvider?: string;
        auth_provider?: string;
        passwordSet?: boolean;
        password_set?: boolean;
      }>("/api/v1/auth/profile");

      // Log para debug - ver o que o backend retorna
      console.log("[PROFILE RAW]", res.data);
      
      // Mapear campos do backend (aceita ambos camelCase e snake_case) para o formato esperado pelo frontend
      const mappedProfile: Profile = {
        id: res.data.id,
        name: res.data.name,
        email: res.data.email,
        // Aceita ambos os formatos (camelCase ou snake_case)
        authProvider: res.data.authProvider || res.data.auth_provider,
        passwordSet: res.data.passwordSet !== undefined ? res.data.passwordSet : res.data.password_set,
      };
      
      console.log("[PROFILE MAPPED]", mappedProfile);
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
  }, [sessionAccessToken]);

  useEffect(() => {
    // Aguardar sessão carregar completamente
    if (sessionStatus === "loading") {
      return;
    }

    // Não fazer fetch se ainda não tiver token e sessão estiver autenticada
    if (sessionStatus === "authenticated" && !sessionAccessToken) {
      console.log("[useBackendProfile] Waiting for accessToken from session...");
      return;
    }

    // Se não estiver autenticado, não fazer fetch
    if (sessionStatus !== "authenticated") {
      setProfile(null);
      setLoading(false);
      setErr(null);
      return;
    }

    // Garantir que o token está sincronizado antes de fazer fetch
    if (sessionAccessToken) {
      setAccessToken(sessionAccessToken);
      // Pequeno delay para garantir que o token foi sincronizado no interceptor
      const syncDelay = setTimeout(() => {
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
      }, 50); // 50ms delay para garantir sincronização

      return () => {
        clearTimeout(syncDelay);
      };
    }
  }, [sessionStatus, sessionAccessToken, fetchProfile]);

  // Função para recarregar o perfil manualmente
  const reload = useCallback(async () => {
    setLoading(true);
    setErr(null);
    // Limpar profile atual para forçar recarregamento completo
    setProfile(null);
    const prof = await fetchProfile();
    if (prof) {
      setProfile(prof);
      retryCountRef.current = 0; // Reset retry count on manual reload
    }
    setLoading(false);
    return prof;
  }, [fetchProfile]);

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
  }, [error, sessionStatus, profile, reload]);

  return { profile, loading, error, reload };
}
