// src/pages/login.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/router";

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

      // 401 = credenciais inválidas
      if (res.status === 401) {
        setErr("Invalid credentials.");
        return;
      }

      // 403 = precisa confirmar o e-mail
      if (res.status === 403) {
        // tenta mostrar msg do backend
        try {
          const data = await res.json().catch(() => null);
          setErr(
            data?.message ||
              data?.detail ||
              "Please confirm your e-mail to sign in."
          );
        } catch {
          setErr("Please confirm your e-mail to sign in.");
        }
        // leva para a tela de "check your e-mail" (com máscara lá)
        setTimeout(() => {
          router.push(`/check-email?email=${encodeURIComponent(email.trim().toLowerCase())}`);
        }, 1200);
        return;
      }

      // 2xx -> sucesso
      if (res.ok) {
        // o backend pode devolver content-type diferente; tentamos json e caímos p/ texto se precisar
        let payload: any = null;
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          payload = await res.json().catch(() => null);
        } else {
          // alguns servidores mandam texto — ignore conteúdo
          await res.text().catch(() => "");
        }

        // normaliza campos possíveis
        const accessToken =
          payload?.accessToken || payload?.token || payload?.jwt || payload?.bearer || null;
        const refreshToken =
          payload?.refreshToken || payload?.refresh_token || null;

        if (!accessToken) {
          setErr("Unexpected response from server.");
          return;
        }

        try {
          localStorage.setItem("access_token", accessToken);
          if (refreshToken) localStorage.setItem("refresh_token", refreshToken);
        } catch {}

        // vai para o dashboard protegido
        router.replace("/protected/dashboard");
        return;
      }

      // outros status → tenta extrair mensagem
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

        {err && (
          <p className="text-center text-red-600 text-sm mb-4">
            {err}
          </p>
        )}

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
              className="w-full p-2 border border-gray-300 rounded text-black pr-16"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-sm px-2 py-1 rounded bg-gray-200 dark:bg-gray-800 dark:text-white"
              aria-label={show ? "Hide password" : "Show password"}
            >
              {show ? "Hide" : "Show"}
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
