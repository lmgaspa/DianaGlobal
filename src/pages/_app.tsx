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
import { primeAccessFromNextAuth } from "@/lib/http";

import "@/styles/globals.css";

/** Lê a sessão do NextAuth e injeta o access token em memória p/ os interceptors. */
function BootstrapAccessFromSession() {
  const { data } = useSession();
  useEffect(() => {
    if (data) primeAccessFromNextAuth(data);
  }, [data]);
  return null;
}

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  useEffect(() => {
    // Limpeza completa de todos os tokens ao abrir o site
    const clearAllTokens = () => {
      try {
        // Limpar localStorage
        localStorage.removeItem("userId");
        localStorage.removeItem("email");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("dg.userEmail");
        localStorage.removeItem("dg.email");
        localStorage.removeItem("dg.userId");
        localStorage.removeItem("dg.name");
        
        // Limpar sessionStorage
        sessionStorage.removeItem("dg.csrf");
        sessionStorage.removeItem("csrf_token");
        
        // Limpar cookies
        document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/api/auth;';
        document.cookie = 'csrf_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/api/auth;';
        document.cookie = 'dg.pendingEmail=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        
        console.log("All tokens cleared on app startup");
      } catch (e) {
        console.log("Error clearing tokens:", e);
      }
    };
    
    clearAllTokens();
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

              {/* App */}
              <Component {...pageProps} />

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
