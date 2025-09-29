"use client";

import { useRouter } from "next/router";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://dianagloballoginregister-52599bd07634.herokuapp.com";

function maskEmail(e: string): string {
  if (!e || !e.includes("@")) return e;
  const [user, domain] = e.split("@");
  if (!domain) return e;

  // mostra 2 primeiras letras do user, o resto *
  const leftUser = user.slice(0, 2);
  const maskedUser =
    leftUser + "*".repeat(Math.max(0, user.length - 2));

  // no domínio, mantém o TLD visível, mascara parte inicial
  const lastDot = domain.lastIndexOf(".");
  if (lastDot <= 0) {
    const keep = Math.min(2, domain.length);
    const head = domain.slice(0, keep);
    return `${maskedUser}@${head}${"*".repeat(Math.max(0, domain.length - keep))}`;
  }
  const domName = domain.slice(0, lastDot);
  const tld = domain.slice(lastDot); // inclui ".com" etc
  const keepDom = Math.min(2, domName.length);
  const domHead = domName.slice(0, keepDom);
  const domMasked =
    domHead + "*".repeat(Math.max(0, domName.length - keepDom));

  return `${maskedUser}@${domMasked}${tld}`;
}

export default function CheckEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [masked, setMasked] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady) return;

    let e =
      typeof router.query.email === "string" ? router.query.email : "";

    // fallback: localStorage (caso /check-email venha sem query)
    if (!e) {
      try {
        const cached = localStorage.getItem("pendingEmail") || "";
        if (cached) e = cached;
      } catch {}
    }

    setEmail(e);
    setMasked(e ? maskEmail(e) : "");
  }, [router.isReady, router.query.email]);

  const resend = async () => {
    if (!email) return;
    setSending(true);
    setError(null);
    setMessage(null);
    try {
      await axios.post(`${API_BASE}/api/auth/confirm/resend`, { email });
      setMessage(
        "Confirmation e-mail sent. Please check your inbox (and spam)."
      );
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.detail ||
          "Failed to resend confirmation e-mail."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-black px-4">
      <div className="bg-white dark:bg-gray-900 p-8 rounded shadow max-w-md w-full text-center">
        <h1 className="text-2xl font-semibold text-black dark:text-white mb-4">
          Check your e-mail
        </h1>
        <p className="text-gray-700 dark:text-gray-300 mb-2">
          We sent an account confirmation link to:
        </p>
        <p className="font-medium text-black dark:text-white mb-6">
          {masked || "your e-mail"}
        </p>
        <p className="text-sm text-gray-500 mb-6">
          If you can’t find it, please check your spam/junk folder.
        </p>

        {message && <p className="text-green-600 text-sm mb-3">{message}</p>}
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

        <button
          onClick={resend}
          disabled={!email || sending}
          className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:opacity-60"
        >
          {sending ? "Resending…" : "Resend confirmation e-mail"}
        </button>

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
