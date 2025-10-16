// src/pages/check-email.tsx
"use client";

import { useRouter } from "next/router";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { getCookie } from "@/utils/cookies";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://dianagloballoginregister-52599bd07634.herokuapp.com";

// delete cookie by setting past expiration
function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax$${
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
  const [confirmed, setConfirmed] = useState<boolean>(false); // NEW

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

  // NEW: auto-check if account already confirmed
  useEffect(() => {
    if (mode !== "confirm" || !email) return;
    axios
      .get(`${API_BASE}/api/auth/confirmed?email=${encodeURIComponent(email)}`)
      .then((res) => {
        if (res?.data?.confirmed === true) {
          setConfirmed(true);
        }
      })
      .catch(() => {});
  }, [email, mode]);

  const resend = async () => {
    if (!email) return;
    setSending(true);
    setError(null);
    setMessage(null);
    try {
      if (mode === "reset") {
        await axios.post(`${API_BASE}/api/auth/forgot-password`, { email });
        setMessage("Password reset e-mail sent. Please check your inbox (and spam).");
      } else {
        await axios.post(`${API_BASE}/api/auth/confirm/resend`, { email });
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
    ? "Resend password reset e-mail"
    : "Resend confirmation e-mail";

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-black px-4">
      <div className="bg-white dark:bg-gray-900 p-8 rounded shadow max-w-md w-full text-center">
        <h1 className="text-2xl font-semibold text-black dark:text-white mb-4">Check your e-mail</h1>
        <p className="text-gray-700 dark:text-gray-300 mb-2">{lead}</p>
        <p className="font-medium text-black dark:text-white mb-6">{masked || "your e-mail"}</p>
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