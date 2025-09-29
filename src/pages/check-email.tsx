"use client";

import { useRouter } from "next/router";
import Link from "next/link";
import { useMemo, useState } from "react";
import axios from "axios";
import { API_BASE } from "../lib/config";

export default function CheckEmailPage() {
  const router = useRouter();
  const email = useMemo(
    () => (typeof router.query.email === "string" ? router.query.email.trim().toLowerCase() : ""),
    [router.query.email]
  );
  const masked = useMemo(() => {
    if (!email) return "";
    const [user, domain] = email.split("@");
    return `${user.slice(0, 2)}***@${domain}`;
  }, [email]);

  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [msg, setMsg] = useState<string>("");

  const resend = async () => {
    if (!email) return;
    try {
      setStatus("sending");
      setMsg("");
      await axios.post(
        `${API_BASE}/api/auth/confirm/resend`,
        { email },
        { headers: { "Content-Type": "application/json", Accept: "application/json" } }
      );
      setStatus("sent");
      setMsg("If the address exists, we’ve sent a new confirmation link.");
    } catch (e: any) {
      setStatus("error");
      setMsg(e?.response?.data?.message || "Could not resend the confirmation e-mail.");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-black px-4">
      <div className="bg-white dark:bg-gray-900 p-8 rounded shadow max-w-md w-full text-center">
        <h1 className="text-2xl font-semibold text-black dark:text-white mb-4">
          Check your e-mail
        </h1>
        <p className="text-gray-700 dark:text-gray-300 mb-2">We sent a confirmation link to:</p>
        <p className="font-medium text-black dark:text-white mb-4">{masked || "your e-mail"}</p>

        <button
          onClick={resend}
          disabled={!email || status === "sending"}
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-60"
        >
          {status === "sending" ? "Resending…" : "Didn’t get it? Resend link"}
        </button>

        {msg && <p className="text-sm mt-3 text-gray-600 dark:text-gray-300">{msg}</p>}

        <p className="text-xs text-gray-500 mt-6">Check your spam/junk folder as well.</p>

        <div className="mt-6">
          <Link href="/login" className="text-blue-600 hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </main>
  );
}
