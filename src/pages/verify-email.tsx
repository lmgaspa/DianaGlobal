"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";

type State = "idle" | "loading" | "success" | "error";

export default function VerifyEmailTokenPage() {
  const router = useRouter();
  const { token, email } = router.query as { token?: string; email?: string };
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState<string>("");

  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://dianagloballoginregister-52599bd07634.herokuapp.com";

  useEffect(() => {
    if (!router.isReady) return;

    // Se vier com token na URL, tenta confirmar automaticamente
    if (typeof token === "string" && token.length > 0) {
      (async () => {
        setState("loading");
        try {
          await axios.post(`${API_BASE}/api/auth/confirm-account`, { token });
          setState("success");
          setMessage("Your e-mail was successfully confirmed. You can now log in.");
        } catch (err: any) {
          const status = err?.response?.status;
          setState("error");
          setMessage(
            status === 400 || status === 401
              ? "Invalid or expired confirmation link."
              : "We could not confirm your e-mail now. Please try again."
          );
        }
      })();
    }
  }, [router.isReady, token, API_BASE]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-black px-4">
      <div className="bg-white dark:bg-gray-900 p-8 rounded shadow max-w-md w-full text-center">
        <h1 className="text-2xl font-semibold text-black dark:text-white mb-4">
          Verify your e-mail
        </h1>

        {state === "idle" && (
          <>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We sent a confirmation link to your e-mail
              {email ? ` (${email})` : ""}. Please check your inbox.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              If you already have a link, open it to confirm your account.
            </p>
          </>
        )}

        {state === "loading" && (
          <p className="text-gray-700 dark:text-gray-300">Confirming your e-mail…</p>
        )}

        {state === "success" && (
          <>
            <p className="text-green-600 mb-6">{message}</p>
            <Link
              className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              href="/login"
            >
              Go to login
            </Link>
          </>
        )}

        {state === "error" && (
          <>
            <p className="text-red-600 mb-6">{message}</p>
            <div className="flex gap-3 justify-center">
              <Link
                className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-black dark:text-white rounded hover:opacity-90 transition"
                href="/verify-code"
              >
                Enter a code instead
              </Link>
              <Link
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                href="/signup"
              >
                Create a new account
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
