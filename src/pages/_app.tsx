// src/pages/_app.tsx
import type { AppProps } from "next/app";
import React, { useEffect } from "react";
import Head from "next/head";
import { SessionProvider, useSession } from "next-auth/react";

import { ThemeProvider } from "@/context/ThemeContext";
import MainContainer from "@/components/GlobalComponent/MainComponent";
import ErrorBoundary from "@/components/ErrorBoundary";
import CookieConsent from "@/components/CookieConsent";
import AnalyticsGate from "@/components/AnalyticsGate";
import ProtectedRouteGuard from "@/components/ProtectedRouteGuard";
import { primeAccessFromNextAuth, setAccessToken } from "@/lib/http";

import "@/styles/globals.css";

/** Lê a sessão do NextAuth e injeta o access token em memória p/ os interceptors. */
function BootstrapAccessFromSession() {
  const { data, status } = useSession();
  useEffect(() => {
    // Só sincronizar quando a sessão estiver carregada (não "loading")
    if (status === "loading") return;
    
    if (data) {
      const token = (data as { accessToken?: string } | null)?.accessToken;
      if (token) {
        console.log("[BootstrapAccessFromSession] Syncing token from NextAuth:", token.substring(0, 20) + "...");
        primeAccessFromNextAuth(data);
      } else {
        console.log("[BootstrapAccessFromSession] No accessToken in session");
      }
    } else {
      // Se não há sessão, limpar token em memória
      setAccessToken(null);
    }
  }, [data, status]);
  return null;
}

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  useEffect(() => {
    // Limpeza seletiva de tokens legados/inválidos ao abrir o site
    // NÃO limpa tokens válidos do NextAuth ou do backend (que estão em cookies HttpOnly)
    const cleanLegacyTokens = () => {
      try {
        // Limpar apenas tokens legados do localStorage (access_token e refresh_token não devem estar aqui)
        // O NextAuth e o backend usam cookies HttpOnly para tokens seguros
        localStorage.removeItem("access_token"); // Token legado, não deve estar aqui
        localStorage.removeItem("refresh_token"); // Token legado, não deve estar aqui
        
        // Manter dados do usuário no localStorage (userId, email, etc) se necessário para outras funcionalidades
        // Remover apenas se realmente não forem mais necessários
        
        // Limpar sessionStorage apenas se necessário (CSRF é gerenciado pelo backend)
        // sessionStorage.removeItem("dg.csrf");
        // sessionStorage.removeItem("csrf_token");
        
        // Cookies HttpOnly (refresh_token, csrf_token) são gerenciados pelo backend
        // NÃO limpar aqui - deixar o backend e NextAuth gerenciarem
        
        // Limpar apenas cookies auxiliares que não são essenciais
        // document.cookie = 'dg.pendingEmail=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        
        // Não logar mais a limpeza para não poluir o console
        // console.log("Legacy tokens cleaned on app startup");
      } catch {
        // Silenciar erros de limpeza
        // console.log("Error cleaning legacy tokens:", e);
      }
    };
    
    // Limpar apenas tokens legados, não sessões válidas
    cleanLegacyTokens();
  }, []);

  return (
    <SessionProvider session={session}>
      <Head>
        {/* PWA manifest */}
        <link rel="manifest" href="/manifest.webmanifest" />

        {/* Favicon (do /public) */}
        <link rel="icon" href="/favicon.ico?v=2" />

        {/* UI colors (respeita light/dark) */}
        <meta name="color-scheme" content="light dark" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#000000" />
      </Head>

      {/* Injeta access em memória ao carregar a sessão */}
      <BootstrapAccessFromSession />

      <ThemeProvider>
        <ErrorBoundary>
          <MainContainer>
            <div className="overflow-hidden">
              {/* GA só quando o usuário aceita cookies */}
              <AnalyticsGate />

              {/* Guard global para rotas protegidas - aplica PasswordRequiredGate automaticamente */}
              <ProtectedRouteGuard>
                {/* App */}
                <Component {...pageProps} />
              </ProtectedRouteGuard>

              {/* Banner de cookies (aceitar/recusar) + texto LGPD */}
              <CookieConsent />
            </div>
          </MainContainer>
        </ErrorBoundary>
      </ThemeProvider>
    </SessionProvider>
  );
}

export default MyApp;
