import type { AppProps } from "next/app";
import React, { useEffect } from "react";
import Head from "next/head";
import { SessionProvider } from "next-auth/react";

import { ThemeProvider } from "@/context/ThemeContext";
import MainContainer from "@/components/GlobalComponent/MainComponent";
import ErrorBoundary from "@/components/ErrorBoundary";
import CookieConsent from "@/components/CookieConsent";
import AnalyticsGate from "@/components/AnalyticsGate";

import "@/styles/globals.css";

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  useEffect(() => {
    try {
      // limpeza de legado
      localStorage.removeItem("userId");
      localStorage.removeItem("email");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    } catch {}
  }, []);

  return (
    <SessionProvider session={session}>
      {/* Head global */}
      <Head>
        {/* PWA manifest */}
        <link rel="manifest" href="/manifest.webmanifest" />

        {/* Favicon (do /public) */}
        <link rel="icon" href="/favicon.ico?v=2" />

        {/* (opcionais, se existir em /public) */}
        {/* <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" /> */}
        {/* <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=2" /> */}
        {/* <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=2" /> */}

        {/* UI colors (respeita light/dark) */}
        <meta name="color-scheme" content="light dark" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#000000" />
      </Head>

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
