"use client";

import { useRouter } from "next/router";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://dianagloballoginregister-52599bd07634.herokuapp.com";

export default function CheckEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [masked, setMasked] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady) return;
    const e = typeof router.query.email === "string" ? router.query.email : "";
    setEmail(e);

    if (e) {
      const [user, domain] = e.split("@");
      const maskedUser = user.slice(0, 2) + "***";
      setMasked(`${maskedUser}@${domain}`);
    }
  }, [router.isReady, router.query.email]);

  const resend = async () => {
    if (!email) return;
    setSending(true);
    setError(null);
    setMessage(null);
    try {
      // Endpoint do backend para reenviar o link de confirmação
      await axios.post(`${API_BASE}/api/auth/confirm/resend`, { email });
      setMessage("Confirmation e-mail sent. Please check your inbox (and spam).");
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
