"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Link from "next/link";
import { API_BASE } from "../lib/config";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!router.isReady) return;
    const token = typeof router.query.token === "string" ? router.query.token : "";
    if (!token) {
      setState("error");
      setMsg("Missing token.");
      return;
    }

    (async () => {
      try {
        await axios.post(
          `${API_BASE}/api/auth/confirm/verify`,
          { token },
          { headers: { "Content-Type": "application/json", Accept: "application/json" } }
        );
        setState("ok");
        setMsg("Your account has been confirmed. You can now sign in.");
      } catch (e: any) {
        setState("error");
        setMsg(e?.response?.data?.message || "Invalid or expired confirmation link.");
      }
    })();
  }, [router.isReady, router.query.token]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-black px-4">
      <div className="bg-white dark:bg-gray-900 p-8 rounded shadow max-w-md w-full text-center">
        <h1 className="text-2xl font-semibold text-black dark:text-white mb-4">
          {state === "loading"
            ? "Confirming…"
            : state === "ok"
            ? "E-mail confirmed"
            : "Confirmation failed"}
        </h1>
        <p className="text-gray-700 dark:text-gray-300 mb-6">{msg}</p>
        <Link
          href="/login"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Go to Login
        </Link>
      </div>
    </main>
  );
}
