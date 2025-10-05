// src/components/AnalyticsGate.tsx
"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/router";
import { getCookie } from "@/utils/cookies";

/**
 * Carrega Google Analytics (gtag) somente com consentimento (cookie_consent_v1.analytics === true).
 * Envia pageviews nas trocas de rota e ativa anonymize_ip.
 */
export default function AnalyticsGate() {
  const [enabled, setEnabled] = useState(false);
  const router = useRouter();
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  useEffect(() => {
    try {
      const raw = getCookie("cookie_consent_v1");
      if (!raw) return;
      const c = JSON.parse(raw);
      if (c?.analytics === true) setEnabled(true);
    } catch {
      /* ignore */
    }
  }, []);

  // dispara page_view em navegações de SPA
  useEffect(() => {
    if (!enabled || !gaId) return;
    const handleRouteChange = (url: string) => {
      // @ts-ignore
      window.gtag?.("config", gaId, { page_path: url });
    };
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => router.events.off("routeChangeComplete", handleRouteChange);
  }, [enabled, gaId, router.events]);

  if (!enabled || !gaId) return null;

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}

          // Consent Mode v2 (opcional; como já há consentimento de analytics, marcamos 'granted')
          try {
            gtag('consent', 'default', {
              ad_user_data: 'denied',
              ad_personalization: 'denied',
              ad_storage: 'denied',
              analytics_storage: 'granted'
            });
          } catch (e) {}

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
