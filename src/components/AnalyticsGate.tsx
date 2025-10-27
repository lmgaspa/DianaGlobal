// src/components/AnalyticsGate.tsx
"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/router";
import { getCookie } from "@/utils/cookies";

type Consent = { necessary: true; analytics: boolean; marketing: boolean };

function readAnalyticsConsent(): boolean {
  try {
    const raw = getCookie("cookie_consent_v1");
    if (!raw) return false;
    const c = JSON.parse(raw) as Consent;
    return c?.analytics === true;
  } catch {
    return false;
  }
}

export default function AnalyticsGate() {
  const router = useRouter();
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const [enabled, setEnabled] = useState<boolean>(false);

  // 1) Estado inicial + 2) Reagir a mudanças (Accept/Reject) via evento global
  useEffect(() => {
    const apply = () => setEnabled(readAnalyticsConsent());
    apply();
    const onChange = () => apply();
    window.addEventListener("cookie-consent-changed", onChange);
    return () => window.removeEventListener("cookie-consent-changed", onChange);
  }, []);

  // 3) Pageviews em navegação SPA (só quando GA está ativo)
  useEffect(() => {
    if (!enabled || !gaId) return;
    const handleRouteChange = (url: string) => {
      // @ts-ignore
      window.gtag?.("config", gaId, { page_path: url });
    };
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => router.events.off("routeChangeComplete", handleRouteChange);
  }, [enabled, gaId, router.events]);

  // 4) (Opcional) “desligar” GA se o usuário retirar consentimento
  useEffect(() => {
    if (enabled) return;
    // Remover scripts injetados (se houverem)
    const s1 = document.getElementById("__ga4-tag");
    const s2 = document.getElementById("gtag-init");
    s1?.parentNode?.removeChild(s1);
    s2?.parentNode?.removeChild(s2);
    // Limpar gtag/datalayer para evitar hits
    // @ts-ignore
    window.dataLayer = undefined;
    // @ts-ignore
    window.gtag = undefined;
  }, [enabled]);

  if (!enabled || !gaId) return null;

  // IMPORTANTE: dê um id fixo no script para remoção futura
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

          // Consent Mode v2 — já há consentimento de analytics; demais negados
          gtag('consent', 'default', {
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            ad_storage: 'denied',
            analytics_storage: 'granted'
          });

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
