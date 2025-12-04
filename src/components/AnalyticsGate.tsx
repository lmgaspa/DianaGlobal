// src/components/AnalyticsGate.tsx
"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/router";
import { getCookie } from "@/utils/cookies";

type Consent = { necessary: true; analytics: boolean; marketing: boolean };
const CONSENT_KEY = "cookie_consent_v1";

// Lê do cookie salvo pelo banner
function hasAnalyticsConsent(): boolean {
  try {
    const raw = getCookie(CONSENT_KEY);
    if (!raw) return false;
    const c = JSON.parse(raw) as Consent;
    return c?.analytics === true;
  } catch {
    return false;
  }
}

// Garante dataLayer/gtag em memória para emitir consent mesmo sem script carregado
function ensureGtag() {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag(...args: unknown[]) {
      window.dataLayer.push(args);
    };
}

export default function AnalyticsGate() {
  const router = useRouter();
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID; // <-- usa o G-XXXX
  const [enabled, setEnabled] = useState(false);

  // Estado inicial + reagir ao evento do banner
  useEffect(() => {
    const apply = () => setEnabled(hasAnalyticsConsent());
    apply();
    const onChange = () => apply();
    if (typeof window !== "undefined") {
      window.addEventListener("cookie-consent-changed", onChange);
      return () => window.removeEventListener("cookie-consent-changed", onChange);
    }
  }, []);

  // Sempre define consent default=denied (CMv2) no load
  useEffect(() => {
    if (typeof window === "undefined") return;
    ensureGtag();
    window.gtag("consent", "default", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied",
    });
  }, []);

  // Pageviews SPA quando GA está ativo
  useEffect(() => {
    if (!enabled || !gaId) return;
    const handleRouteChange = (url: string) => {
      window.gtag?.("config", gaId, { page_path: url });
    };
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => router.events.off("routeChangeComplete", handleRouteChange);
  }, [enabled, gaId, router.events]);

  // Se o usuário retirar consentimento, “desliga” o GA
  useEffect(() => {
    if (typeof window === "undefined") return;
    ensureGtag();
    if (!enabled) {
      // Atualiza consent para negar
      window.gtag("consent", "update", {
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      });
      // Remove scripts se existirem
      document.getElementById("__ga4-tag")?.remove();
      document.getElementById("gtag-init")?.remove();
      return;
    }

    // Se habilitou, concede analytics (demais continuam negados por padrão)
    window.gtag("consent", "update", {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
  }, [enabled]);

  if (!enabled || !gaId) return null;

  // Carrega GA4 só quando há consentimento
  return (
    <>
      <Script
        id="__ga4-tag"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', {
            page_path: window.location.pathname,
            anonymize_ip: true
          });
        `}
      </Script>
    </>
  );
}
