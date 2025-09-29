// src/pages/login.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://dianagloballoginregister-52599bd07634.herokuapp.com";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const setClientCookies = (accessToken?: string | null, refreshToken?: string | null) => {
    try {
      if (accessToken) {
        // 30 min
        document.cookie = `access_token=${encodeURIComponent(
          accessToken
        )}; Path=/; Max-Age=1800; SameSite=Lax; Secure`;
      }
      if (refreshToken) {
        // 7 dias
        document.cookie = `refresh_token=${encodeURIComponent(
          refreshToken
        )}; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax; Secure`;
      }
    } catch {
      /* noop */
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      if (res.status === 401) {
        setErr("Invalid credentials.");
        return;
      }

      if (res.status === 403) {
        // precisa confirmar o e-mail primeiro
        let msg = "Please confirm your e-mail to sign in.";
        try {
          const data = await res.json();
          msg = data?.message || data?.detail || msg;
        } catch {}
        setErr(msg);
        setTimeout(() => {
          router.push(`/check-email?email=${encodeURIComponent(email.trim().toLowerCase())}`);
        }, 1000);
        return;
      }

      if (res.ok) {
        // Tenta json; cai pra texto se necessário
        let payload: any = null;
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          payload = await res.json().catch(() => null);
        } else {
          await res.text().catch(() => "");
        }

        // chaves tolerantes (back pode devolver accessToken/token/jwt)
        const accessToken: string | null =
          payload?.accessToken || payload?.token || payload?.jwt || payload?.bearer || null;
        const refreshToken: string | null =
          payload?.refreshToken || payload?.refresh_token || null;

        if (!accessToken) {
          setErr("Unexpected response from server.");
          return;
        }

        try {
          localStorage.setItem("access_token", accessToken);
          if (refreshToken) localStorage.setItem("refresh_token", refreshToken);
        } catch {}

        setClientCookies(accessToken, refreshToken);

        // garante que o redirect aconteça antes de qualquer guard ler o estado atual
        await router.replace("/protected/dashboard");
        return;
      }

      // Outros status → tenta mensagem
      try {
        const ct2 = res.headers.get("content-type") || "";
        if (ct2.includes("application/json")) {
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

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-black px-4">
      <div className="bg-white dark:bg-gray-900 p-8 rounded shadow max-w-md w-full">
        <h1 className="text-2xl font-semibold text-center text-black dark:text-white mb-4">
          Sign in
        </h1>

        {err && <p className="text-center text-red-600 text-sm mb-4">{err}</p>}

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
              className="w-full p-2 border border-gray-300 rounded text-black pr-10"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600"
              aria-label={show ? "Hide password" : "Show password"}
              title={show ? "Hide password" : "Show password"}
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
      </div>
    </main>
  );
}
