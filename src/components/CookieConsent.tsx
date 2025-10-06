// src/components/CookieConsent.tsx
"use client";
import { useEffect, useState } from "react";
import { getCookie, setCookie } from "@/utils/cookies";

type Consent = { necessary: true; analytics: boolean; marketing: boolean };
const KEY = "cookie_consent_v1";
const DEFAULT: Consent = { necessary: true, analytics: false, marketing: false };

export default function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const raw = getCookie(KEY);
    if (!raw) { setOpen(true); return; }
    try {
      JSON.parse(raw) as Consent; // só valida
      setOpen(false);
    } catch {
      setOpen(true);
    }
  }, []);

  const save = (consent: Consent) => {
    setCookie(KEY, JSON.stringify(consent), 365, {
      sameSite: "Lax",
      secure: typeof location !== "undefined" && location.protocol === "https:",
      path: "/",
    });
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 bg-blue-200 dark:bg-gray-900/95 backdrop-blur border-t p-4 shadow">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center gap-4">
        <p className="text-sm text-gray-900 dark:text-gray-100 md:flex-1">
          We use cookies to improve your experience (LGPD/BR) and (GDPR/UE). You can accept or reject.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => save(DEFAULT)} // -> {"analytics": false}
            className="px-3 py-1.5 rounded bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={() => save({ necessary: true, analytics: true, marketing: false })} // -> {"analytics": true}
            className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
