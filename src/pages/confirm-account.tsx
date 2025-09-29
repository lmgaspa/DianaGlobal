// src/pages/confirm-account.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ok"; msg: string }
  | { kind: "err"; msg: string };

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://dianagloballoginregister-52599bd07634.herokuapp.com";

export default function ConfirmAccountPage() {
  const router = useRouter();
  const [token, setToken] = useState<string>("");
  const [state, setState] = useState<State>({ kind: "idle" });

  // para reenvio manual quando falhar
  const [email, setEmail] = useState("");
  const [resending, setResending] = useState(false);
  const canResend = useMemo(() => /\S+@\S+\.\S+/.test(email), [email]);

  // 1) token via router.query
  useEffect(() => {
    if (!router.isReady) return;
    const t = typeof router.query.token === "string" ? router.query.token : "";
    if (t) setToken(t);
  }, [router.isReady, router.query.token]);

  // 2) fallback: token via window.location
  useEffect(() => {
    if (token) return;
    if (typeof window === "undefined") return;
    const t = new URLSearchParams(window.location.search).get("token") ?? "";
    if (t) setToken(t);
  }, [token]);

  // Chama o backend quando tiver token
  useEffect(() => {
    if (!token) return;
    const confirm = async () => {
      setState({ kind: "loading" });
      try {
        const res = await fetch(
          `${API_BASE}/api/auth/confirm-account?token=${encodeURIComponent(token)}`,
          { method: "POST" }
        );

        if (res.ok) {
          setState({
            kind: "ok",
            msg: "Your e-mail has been confirmed. You can log in now.",
          });
        } else {
          // tenta extrair mensagem do backend
          let msg = "Invalid or expired link.";
          try {
            const ct = res.headers.get("content-type") || "";
            if (ct.includes("application/json")) {
              const j = await res.json();
              msg = j?.message || j?.detail || msg;
            } else {
              msg = (await res.text()) || msg;
            }
          } catch {}
          setState({ kind: "err", msg });
        }
      } catch (e: any) {
        setState({
          kind: "err",
          msg: e?.message || "We couldn’t confirm your e-mail right now.",
        });
      }
    };
    confirm();
  }, [token]);

  const resend = async () => {
    if (!canResend) return;
    setResending(true);
    try {
      await fetch(`${API_BASE}/api/auth/confirm/resend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      // sempre 200 (não vaza existência); apenas informa para checar caixa de entrada
      setState({
        kind: "ok",
        msg: "If an account exists for this e-mail, we sent a new confirmation link.",
      });
    } catch (e: any) {
      setState({
        kind: "err",
        msg: e?.message || "Couldn’t resend the confirmation link.",
      });
    } finally {
      setResending(false);
    }
  };

  const title =
    state.kind === "ok"
      ? "Confirmation successful"
      : state.kind === "err"
      ? "Confirmation failed"
      : token
      ? "Confirming…"
      : "Confirmation failed";

  const body =
    !token && state.kind === "idle"
      ? "Missing token. Please use the link from your e-mail."
      : state.kind === "loading"
      ? "Please wait while we confirm your e-mail."
      : state.kind === "ok"
      ? state.msg
      : state.kind === "err"
      ? state.msg
      : "";

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-black px-4">
      <div className="bg-white dark:bg-gray-900 p-8 rounded shadow max-w-md w-full text-center">
        <h1 className="text-2xl font-semibold text-black dark:text-white mb-3">
          {title}
        </h1>

        <p
          className={`mb-6 ${
            state.kind === "err"
              ? "text-red-500"
              : state.kind === "ok"
              ? "text-green-600"
              : "text-gray-700 dark:text-gray-300"
          }`}
        >
          {body}
        </p>

        {state.kind === "loading" && (
          <div className="text-sm text-gray-500 mb-6">Processing…</div>
        )}

        {/* Formulário opcional para reenviar quando der erro */}
        {state.kind === "err" && (
          <div className="mb-6 text-left">
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">
              Didn’t get the e-mail? Enter your e-mail to resend the link:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
              placeholder="you@example.com"
              className="w-full p-2 border border-gray-300 rounded mb-3 text-black"
              autoComplete="email"
            />
            <button
              onClick={resend}
              disabled={!canResend || resending}
              className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:opacity-60"
            >
              {resending ? "Resending…" : "Resend confirmation e-mail"}
            </button>
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <a
            href="/login"
            className="inline-block px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 transition"
          >
            Go to Login
          </a>
          <a
            href="/signup"
            className="inline-block px-4 py-2 bg-gray-200 dark:bg-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-700 transition"
          >
            Create account
          </a>
        </div>
      </div>
    </main>
  );
}
