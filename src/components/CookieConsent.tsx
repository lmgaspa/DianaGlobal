import { useEffect, useState } from "react";
import { getCookie, setCookie } from "@/utils/cookies";

const KEY = "cookie_consent"; // "true" | "false"

export default function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const raw = getCookie(KEY);
    if (raw === null) setOpen(true); // banner aparece até o usuário decidir
  }, []);

  const accept = () => {
    setCookie(KEY, "true", 365, { sameSite: "Lax", secure: typeof location !== "undefined" && location.protocol === "https:" });
    setOpen(false);
  };

  const reject = () => {
    setCookie(KEY, "false", 365, { sameSite: "Lax", secure: typeof location !== "undefined" && location.protocol === "https:" });
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-50 bg-white/95 dark:bg-gray-900/95 text-black dark:text-white backdrop-blur border-t border-gray-200 dark:border-gray-800 p-4 shadow"
    >
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center gap-4">
        <p className="text-sm md:flex-1">
          We use cookies to improve your experience, in line with Brazilian law (LGPD). You can <strong>accept</strong> or <strong>reject</strong> optional cookies at any time.
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={reject}
            className="px-3 py-2 rounded bg-gray-200 text-black hover:bg-gray-300 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
            aria-label="Reject cookies"
          >
            Reject
          </button>
          <button
            onClick={accept}
            className="px-3 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
            aria-label="Accept cookies"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
