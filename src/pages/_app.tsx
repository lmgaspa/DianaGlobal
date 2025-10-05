// src/pages/_app.tsx
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
      localStorage.removeItem("userId");
      localStorage.removeItem("email");
    } catch {}
  }, []);

  return (
    <SessionProvider session={session}>
      {/* Head global: usa o favicon que está em /public/favicon.ico */}
      <Head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" href="/favicon.ico" />
        {/* (opcionais, se você já tiver esses arquivos em /public) */}
        {/* <link rel="apple-touch-icon" href="/apple-touch-icon.png" /> */}
        {/* <link rel="manifest" href="/manifest.json" /> */}
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

              {/* Sua aplicação */}
              <Component {...pageProps} />

              {/* Banner de cookies (accept/reject) */}
              <CookieConsent />
            </div>
          </MainContainer>
        </ErrorBoundary>
      </ThemeProvider>
    </SessionProvider>
  );
}

export default MyApp;
