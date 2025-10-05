import Script from "next/script";
import { useEffect, useState } from "react";
import { getCookie } from "@/utils/cookies";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "G-VZVY5E6YNN"; // ajuste se quiser via env

export default function AnalyticsGate() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const raw = getCookie("cookie_consent"); // "true" | "false" | null
    setAllowed(raw === "true");
  }, []);

  if (!allowed) return null;

  return (
    <>
      <Script strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
      <Script
        id="ga4"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', { page_path: window.location.pathname });
          `,
        }}
      />
    </>
  );
}
