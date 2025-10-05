// src/pages/login.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { setCookie } from "@/utils/cookies";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://dianagloballoginregister-52599bd07634.herokuapp.com";

export default function LoginPage(): JSX.Element {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [needsGoogle, setNeedsGoogle] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setNeedsGoogle(false);
    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
        credentials: "include", // se backend emite cookies (refresh/CSRF)
      });

      if (res.status === 401) {
        setErr("Invalid credentials.");
        return;
      }

      if (res.status === 403) {
        // tenta exibir msg
        let msg = "Please confirm your e-mail to sign in.";
        try {
          const data = await res.json();
          msg = data?.message || data?.detail || msg;
        } catch {}
        setErr(msg);

        // caso específico do Google (mensagem vinda do backend)
        if (/google/i.test(msg) && /password/i.test(msg)) {
          setNeedsGoogle(true);
        } else {
          // fluxo de “confirm your email” — leva ao check-email em modo confirm
          setTimeout(() => {
            try {
              // guarda pendência via COOKIE (não mais localStorage)
              setCookie("dg.pendingEmail", email.trim().toLowerCase(), 1, {
                sameSite: "Lax",
                secure: typeof location !== "undefined" && location.protocol === "https:",
              });
            } catch {}
            router.push(
              `/check-email?mode=confirm&email=${encodeURIComponent(email.trim().toLowerCase())}`
            );
          }, 1200);
        }
        return;
      }

      if (res.ok) {
        // Deixa NextAuth criar a sessão de forma consistente (credentials provider)
        const result = await signIn("credentials", {
          redirect: false,
          email: email.trim().toLowerCase(),
          password,
        });
        if (result?.error) {
          setErr("Unexpected error.");
          return;
        }

        // ✅ LIMPEZA (cookies de pendência, se existirem)
        try {
          setCookie("dg.pendingEmail", "", -1, {
            sameSite: "Lax",
            secure: typeof location !== "undefined" && location.protocol === "https:",
          });
          setCookie("dg.pendingResetEmail", "", -1, {
            sameSite: "Lax",
            secure: typeof location !== "undefined" && location.protocol === "https:",
          });
        } catch {}

        router.replace("/protected/dashboard");
        return;
      }

      // tratar outros erros
      try {
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          const j = await res.json();
          setErr(j?.message || j?.detail || `Error ${res.status}`);
        } else {
          const t = await res.text();
          setErr(t || `Error ${res.status}`);
        }
      } catch {
        setErr("Unexpected response from server.");
      }
    } catch (e: any) {
      setErr(e?.message || "Network error.");
    } finally {
      setSubmitting(false);
    }
  };

  const onGoogle = () => {
    try {
      // cleanup antes do fluxo externo de OAuth (evita pendências antigas) — cookies
      setCookie("dg.pendingEmail", "", -1, {
        sameSite: "Lax",
        secure: typeof location !== "undefined" && location.protocol === "https:",
      });
      setCookie("dg.pendingResetEmail", "", -1, {
        sameSite: "Lax",
        secure: typeof location !== "undefined" && location.protocol === "https:",
      });
    } catch {}
    // NextAuth Google
    signIn("google", { callbackUrl: "/protected/dashboard" });
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-black px-4">
      <div className="bg-white dark:bg-gray-900 p-8 rounded shadow max-w-md w-full">
        <h1 className="text-2xl font-semibold text-center text-black dark:text-white mb-4">Sign in</h1>

        {err && <p className="text-center text-red-600 text-sm mb-4">{err}</p>}

        {needsGoogle ? (
          <div className="text-center mb-4">
            <button
              onClick={onGoogle}
              className="w-full py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              Continue with Google
            </button>
            <p className="text-xs text-gray-600 mt-2">
              Then you can set a password inside your account if you want.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full p-2 border border-gray-300 rounded text-black"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="relative">
              <input
                type={show ? "text" : "password"}
                placeholder="Your password"
                className="w-full p-2 border border-gray-300 rounded text-black pr-12"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5
                           bg-transparent
                           text-slate-600 hover:text-blue-600
                           dark:text-gray-300 dark:hover:text-blue-400"
                aria-label={show ? "Hide password" : "Show password"}
              >
                {show ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:opacity-60"
            >
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>
        )}

        <div className="text-center mt-4">
          <a href="/forgot-password" className="text-blue-500 hover:underline">
            Forgot your password?
          </a>
        </div>

        <p className="text-center text-sm mt-4 text-black dark:text-white">
          Don’t have an account?{" "}
          <a href="/signup" className="text-blue-500 hover:underline">
            Create one
          </a>
        </p>

        {!needsGoogle && (
          <div className="max-w-sm mx-auto p-4">
            <GoogleSignInButton callbackUrl="/protected/dashboard" />
          </div>
        )}
      </div>
    </main>
  );
}
