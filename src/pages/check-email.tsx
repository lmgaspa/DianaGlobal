"use client";

import { useRouter } from "next/router";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api"; // <- cliente centralizado (interceptors: auth + CSRF)
import { getCookie } from "@/utils/cookies";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://dianagloballoginregister-52599bd07634.herokuapp.com";

// delete cookie by setting past expiration
function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax${
    typeof location !== "undefined" && location.protocol === "https:" ? ";Secure" : ""
  }`;
}

function maskEmail(e: string): string {
  if (!e || !e.includes("@")) return e;
  const [user, domain] = e.split("@");
  const leftUser = user.slice(0, 2);
  const maskedUser = leftUser + "*".repeat(Math.max(0, user.length - 2));
  const lastDot = domain.lastIndexOf(".");
  if (lastDot <= 0) {
    const keep = Math.min(2, domain.length);
    return `${maskedUser}@${domain.slice(0, keep)}${"*".repeat(Math.max(0, domain.length - keep))}`;
  }
  const domName = domain.slice(0, lastDot);
  const tld = domain.slice(lastDot);
  const keepDom = Math.min(2, domName.length);
  const domMasked = domName.slice(0, keepDom) + "*".repeat(Math.max(0, domName.length - keepDom));
  return `${maskedUser}@${domMasked}${tld}`;
}

export default function CheckEmailPage() {
  const router = useRouter();

  const mode = useMemo<"reset" | "confirm">(() => {
    const m = (router.query.mode as string) || "confirm";
    return m === "reset" ? "reset" : "confirm";
  }, [router.query.mode]);

  const [email, setEmail] = useState("");
  const [masked, setMasked] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<boolean>(false);

  // Recupera o e-mail (query ou cookie temporário salvo em telas anteriores)
  useEffect(() => {
    if (!router.isReady) return;

    let e = typeof router.query.email === "string" ? router.query.email : "";

    if (!e) {
      const key = mode === "reset" ? "dg.pendingResetEmail" : "dg.pendingEmail";
      const cached = getCookie(key) || "";
      if (cached) {
        e = cached;
        deleteCookie(key);
      }
    }

    setEmail(e);
    setMasked(e ? maskEmail(e) : "");
  }, [router.isReady, router.query.email, mode]);

  // Checa o status de confirmação da conta — tolera payload antigo e novo (OCP-friendly)
  useEffect(() => {
    if (mode !== "confirm" || !email) return;

    async function run() {
      try {
        const res = await fetch(
          `${API_BASE}/api/auth/confirmed?email=${encodeURIComponent(email)}`,
          { credentials: "include" }
        );

        let isOk = false;
        if (res.ok) {
          const ct = res.headers.get("content-type") || "";
          if (ct.includes("application/json")) {
            const d: any = await res.json();
            // formato antigo: { confirmed: boolean }
            if (typeof d?.confirmed === "boolean") isOk = d.confirmed === true;
            // formato novo: { status: "confirmed" | ... } ou "confirmed"
            const status = d?.status || (typeof d === "string" ? d : undefined);
            if (status === "confirmed") isOk = true;
          } else {
            // string pura
            const txt = (await res.text()).trim().toLowerCase();
            if (txt === "confirmed") isOk = true;
          }
        }
        setConfirmed(isOk);
      } catch {
        // mantém false silenciosamente
      }
    }

    run();
  }, [email, mode]);

  // Reenvio de e-mail (confirm/reset) usando api centralizada (CSRF via interceptors)
  const resend = async () => {
    if (!email) return;
    setSending(true);
    setError(null);
    setMessage(null);
    try {
      if (mode === "reset") {
        await api.post("/api/auth/forgot-password", { email: email.trim().toLowerCase() });
        setMessage("Password reset e-mail sent. Please check your inbox (and spam).");
      } else {
        await api.post("/api/auth/confirm/resend", { email: email.trim().toLowerCase() });
        setMessage("Confirmation e-mail sent. Please check your inbox (and spam).");
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.detail ||
          (mode === "reset"
            ? "Failed to resend password reset e-mail."
            : "Failed to resend confirmation e-mail.")
      );
    } finally {
      setSending(false);
    }
  };

  const lead = confirmed
    ? "Your account is now confirmed."
    : mode === "reset"
    ? "We sent a password reset link to:"
    : "We sent an account confirmation link to:";

  const buttonText = mode === "reset"
    ? "Resend password reset email"
    : "Resend confirmation email";

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-black px-4">
      <div className="bg-white dark:bg-gray-900 p-8 rounded shadow max-w-md w-full text-center">
        <h1 className="text-2xl font-semibold text-black dark:text-white mb-4">Check your email</h1>
        <p className="text-gray-700 dark:text-gray-300 mb-2">{lead}</p>
        <p className="font-medium text-black dark:text-white mb-6">{masked || "your email"}</p>
        <p className="text-sm text-gray-500 mb-6">
          {!confirmed && "If you can’t find it, please check your spam/junk folder."}
        </p>

        {message && <p className="text-green-600 text-sm mb-3">{message}</p>}
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

        {!confirmed && (
          <button
            onClick={resend}
            disabled={!email || sending || confirmed}
            className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:opacity-60"
          >
            {sending ? "Resending…" : buttonText}
          </button>
        )}

        <div className="mt-6">
          <Link
            href="/login"
            className="inline-block px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 transition"
          >
            Go to Login
          </Link>
        </div>
      </div>
    </main>
  );
}
