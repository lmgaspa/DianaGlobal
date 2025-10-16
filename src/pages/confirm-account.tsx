// src/pages/confirm-account.tsx
"use client";

import { useEffect, useRef, useState } from "react";
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
  const [token, setToken] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });

  useEffect(() => {
    if (!router.isReady) return;
    const t =
      typeof router.query.token === "string"
        ? router.query.token
        : new URLSearchParams(window.location.search).get("token") ?? "";
    if (t) setToken(t);
  }, [router.isReady, router.query.token]);

  const didCallRef = useRef(false);

  useEffect(() => {
    if (!token || didCallRef.current) return;
    didCallRef.current = true;

    let timer: any;

    (async () => {
      setState({ kind: "loading" });
      try {
        const res = await fetch(
          `${API_BASE}/api/auth/confirm-account?token=${encodeURIComponent(token)}`,
          { method: "POST" }
        );

        if (res.ok) {
          setState({
            kind: "ok",
            msg:
              "Your e-mail has been confirmed and you can log in now. A welcome message was sent to your inbox!",
          });
          timer = setTimeout(() => router.push("/login?confirmed=1"), 3000);
          return;
        }

        let msg = "";
        try {
          const ct = res.headers.get("content-type") || "";
          if (ct.includes("application/json")) {
            const j = await res.json();
            msg = j?.message || j?.detail || "";
          } else {
            msg = (await res.text()) || "";
          }
        } catch {
          /* ignore */
        }

        switch (res.status) {
          case 400:
          case 401:
            msg ||= "Invalid or expired link.";
            break;
          case 403:
            msg ||= "This confirmation link cannot be used.";
            break;
          case 410:
            msg ||= "This confirmation link has expired. Please request a new one.";
            break;
          default:
            msg ||= "Internal server error";
        }
        setState({ kind: "err", msg });
      } catch (e: any) {
        setState({
          kind: "err",
          msg: e?.message || "Could not confirm right now. Please try again.",
        });
      }
    })();

    return () => clearTimeout(timer);
  }, [token, router]);

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
    : state.kind === "ok" || state.kind === "err"
    ? state.msg
    : "";

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-black px-4">
      <div className="bg-white dark:bg-gray-900 p-8 rounded shadow max-w-md w-full text-center">
        <h1 className="text-2xl font-semibold text-black dark:text-white mb-3">{title}</h1>
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
        {/* No buttons on success (auto-redirect). */}
      </div>
    </main>
  );
}
