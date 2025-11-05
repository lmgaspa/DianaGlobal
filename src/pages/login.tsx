// src/pages/login.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { setCookie } from "@/utils/cookies";
import {
  captureCsrfFromFetchResponse,
} from "@/lib/security/csrf";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://dianagloballoginregister-52599bd07634.herokuapp.com";

/** Error shape for EMAIL_UNCONFIRMED coming from backend */
type UnconfirmedMeta = {
  error?: "EMAIL_UNCONFIRMED" | string;
  message?: string;
  canResend?: boolean;
  cooldownSecondsRemaining?: number;
  attemptsToday?: number;
  maxPerDay?: number;
  nextAllowedAt?: string; // ISO
  status?: "CONFIRMATION_EMAIL_SENT" | "ALREADY_CONFIRMED" | string;
};

const lsKey = (email: string) =>
  `dg.confirmCooldown:${email.trim().toLowerCase()}`;

const secondsUntil = (iso?: string) => {
  if (!iso) return 0;
  const t = new Date(iso).getTime();
  const diff = Math.ceil((t - Date.now()) / 1000);
  return diff > 0 ? diff : 0;
};

export default function LoginPage(): JSX.Element {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [err, setErr] = useState<string | null>(null);
  const [needsGoogle, setNeedsGoogle] = useState(false);

  // Unconfirmed email state (409 EMAIL_UNCONFIRMED)
  const [unconfirmed, setUnconfirmed] = useState<UnconfirmedMeta | null>(null);
  const [cooldown, setCooldown] = useState<number>(0);
  const [resendBusy, setResendBusy] = useState(false);
  const [resendMsg, setResendMsg] = useState<string | null>(null);

  // cooldown ticker
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(
      () => setCooldown((s) => (s > 0 ? s - 1 : 0)),
      1000
    );
    return () => clearInterval(id);
  }, [cooldown]);

  const primeCooldownFromMeta = (meta: UnconfirmedMeta | null, em: string) => {
    const normalized = em.trim().toLowerCase();

    // tenta reaproveitar localStorage (throttle compartilhado entre reloads)
    const saved =
      typeof window !== "undefined"
        ? localStorage.getItem(lsKey(normalized))
        : null;

    if (saved) {
      setCooldown(secondsUntil(saved));
      return;
    }

    if (meta?.nextAllowedAt) {
      setCooldown(secondsUntil(meta.nextAllowedAt));
    } else if (typeof meta?.cooldownSecondsRemaining === "number") {
      setCooldown(meta.cooldownSecondsRemaining);
    } else {
      setCooldown(0);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setNeedsGoogle(false);
    setUnconfirmed(null);
    setResendMsg(null);
    setSubmitting(true);

    const normalized = email.trim().toLowerCase();

    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email: normalized, password }),
        credentials: "include",
      });

      // salva o CSRF vindo do header X-CSRF-Token (mantém OCP: captura centralizada)
      captureCsrfFromFetchResponse(res);

      if (res.status === 401) {
        setErr("Invalid credentials.");
        return;
      }

      if (res.status === 403) {
          // geralmente: "Use Sign in with Google or set a password first."
        let msg = "Please confirm your email to sign in.";
        try {
          const data = await res.json();
          msg = data?.message || data?.detail || msg;
        } catch {
          /* ignore parse fail */
        }
        setErr(msg);

        // se o backend falou "use google ou defina senha primeiro"
        if (/google/i.test(msg) && /password/i.test(msg)) {
          setNeedsGoogle(true);
        } else {
          // caso de e-mail não confirmado => já manda ele pra tela check-email
          setTimeout(() => {
            try {
              setCookie("dg.pendingEmail", normalized, 1, {
                sameSite: "Lax",
                secure:
                  typeof location !== "undefined" &&
                  location.protocol === "https:",
              });
            } catch {
              /* ignore cookie fail */
            }
            router.push(
              `/check-email?mode=confirm&email=${encodeURIComponent(
                normalized
              )}`
            );
          }, 3000);
        }
        return;
      }

      // 409 => erro tipado EMAIL_UNCONFIRMED com metadados (cooldown etc)
      if (res.status === 409) {
        let meta: UnconfirmedMeta | null = null;
        try {
          meta = await res.json();
        } catch {
          /* ignore */
        }
        if (meta?.error === "EMAIL_UNCONFIRMED") {
          setUnconfirmed(meta);
          setErr(meta.message || "Email not confirmed.");
          primeCooldownFromMeta(meta, normalized);
          return;
        }
      }

      if (res.ok) {
        // integra com NextAuth credentials provider
        const result = await signIn("credentials", {
          redirect: false,
          email: normalized,
          password,
        });

        if (result?.error) {
          setErr("Unexpected error.");
          return;
        }

        // limpeza de cookies auxiliares usados em telas tipo check-email / reset-password
        try {
          setCookie("dg.pendingEmail", "", -1, {
            sameSite: "Lax",
            secure:
              typeof location !== "undefined" &&
              location.protocol === "https:",
          });
          setCookie("dg.pendingResetEmail", "", -1, {
            sameSite: "Lax",
            secure:
              typeof location !== "undefined" &&
              location.protocol === "https:",
          });
        } catch {
          /* ignore */
        }

        router.replace("/protected/dashboard");
        return;
      }

      // fallback genérico p/ códigos não tratados
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

  // POST /api/v1/auth/confirm/resend
  const onResend = async () => {
    const normalized = email.trim().toLowerCase();
    if (!normalized) return;

    setResendBusy(true);
    setResendMsg(null);

    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/confirm/resend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: normalized,
          // o backend exige frontendBaseUrl no DTO ConfirmationRequest
          frontendBaseUrl:
            (typeof window !== "undefined" && window.location.origin) ||
            "https://www.dianaglobal.com.br",
        }),
      });

      const maybeJson = async () => {
        try {
          return await res.json();
        } catch {
          return {};
        }
      };

      if (res.status === 200) {
        const data = (await maybeJson()) as UnconfirmedMeta;

        setResendMsg(
          "If an account exists for this email, we sent a confirmation link."
        );

        // persistir cooldown (tanto na memória quanto no localStorage)
        if (data?.nextAllowedAt) {
          localStorage.setItem(lsKey(normalized), data.nextAllowedAt);
          setCooldown(secondsUntil(data.nextAllowedAt));
        } else if (typeof data?.cooldownSecondsRemaining === "number") {
          setCooldown(data.cooldownSecondsRemaining);
        }

        setUnconfirmed((prev) => ({
          ...(prev ?? {}),
          canResend: Boolean(data?.canResend),
          attemptsToday: data?.attemptsToday ?? prev?.attemptsToday,
          maxPerDay: data?.maxPerDay ?? prev?.maxPerDay,
          nextAllowedAt: data?.nextAllowedAt ?? prev?.nextAllowedAt,
          status: data?.status ?? prev?.status,
        }));
      } else if (res.status === 429) {
        // throttle estourado
        const data = (await maybeJson()) as UnconfirmedMeta;
        setResendMsg(
          data?.message || "Please wait before trying again."
        );

        const secs =
          typeof data?.cooldownSecondsRemaining === "number"
            ? data.cooldownSecondsRemaining
            : secondsUntil(data?.nextAllowedAt);

        if (data?.nextAllowedAt) {
          localStorage.setItem(lsKey(normalized), data.nextAllowedAt);
        }

        setCooldown(secs > 0 ? secs : 60);

        setUnconfirmed((prev) => ({
          ...(prev ?? {}),
          canResend: false,
          attemptsToday: data?.attemptsToday ?? prev?.attemptsToday,
          maxPerDay: data?.maxPerDay ?? prev?.maxPerDay,
          nextAllowedAt: data?.nextAllowedAt ?? prev?.nextAllowedAt,
          status: data?.status ?? prev?.status,
        }));
      } else if (res.status === 409) {
        // já confirmado etc
        const data = (await maybeJson()) as UnconfirmedMeta;
        if (data?.status === "ALREADY_CONFIRMED") {
          setResendMsg("Your account is already confirmed. Please sign in.");
          setCooldown(0);
          setUnconfirmed((p) => ({
            ...(p ?? {}),
            canResend: false,
            status: data.status,
          }));
        } else {
          setResendMsg(
            data?.message || "Unable to resend now."
          );
        }
      } else {
        // fallback genérico
        const data = (await maybeJson()) as any;
        setResendMsg(
          data?.message ||
            data?.detail ||
            `Error ${res.status}`
        );
      }
    } catch (e: any) {
      setResendMsg(e?.message || "Network error.");
    } finally {
      setResendBusy(false);
    }
  };

  const onGoogle = () => {
    try {
      setCookie("dg.pendingEmail", "", -1, {
        sameSite: "Lax",
        secure:
          typeof location !== "undefined" &&
          location.protocol === "https:",
      });
      setCookie("dg.pendingResetEmail", "", -1, {
        sameSite: "Lax",
        secure:
          typeof location !== "undefined" &&
          location.protocol === "https:",
      });
    } catch {
      /* ignore */
    }
    signIn("google", { callbackUrl: "/protected/dashboard" });
  };

  // botar em boolean puro p/ atributo disabled
  const resendDisabled: boolean =
    resendBusy || cooldown > 0 || (unconfirmed?.canResend === false);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-black px-4">
      <div className="bg-white dark:bg-gray-900 p-8 rounded shadow max-w-md w-full">
        <h1 className="text-2xl font-semibold text-center text-black dark:text-white mb-4">
          Sign in
        </h1>

        {err && (
          <p className="text-center text-red-600 text-sm mb-4">{err}</p>
        )}

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
              {submitting ? "Signing in..." : "Sign in"}
            </button>
          </form>
        )}

        {/* Bloco de reenvio só aparece se backend retornou 409 EMAIL_UNCONFIRMED */}
        {unconfirmed && (
          <div className="mt-4 p-3 rounded border bg-amber-50 text-amber-900">
            <div className="text-sm mb-2">
              Didn't receive the confirmation link? You can resend it below.
            </div>

            <div className="flex gap-8 items-center flex-wrap">
              <button
                onClick={onResend}
                disabled={resendDisabled}
                className={`px-4 py-2 rounded border font-semibold ${
                  resendDisabled
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:bg-zinc-900 hover:text-white"
                }`}
              >
                {resendBusy
                  ? "Sending..."
                  : cooldown > 0
                  ? `Resend in ${Math.floor(cooldown / 60)
                      .toString()
                      .padStart(2, "0")}:${(cooldown % 60)
                      .toString()
                      .padStart(2, "0")}`
                  : "Resend confirmation email"}
              </button>

              <div className="text-xs">
                Attempts today:{" "}
                <strong>{unconfirmed.attemptsToday ?? 0}</strong> /{" "}
                {unconfirmed.maxPerDay ?? 5}
              </div>
            </div>

            {resendMsg && (
              <div className="text-sm mt-2">{resendMsg}</div>
            )}
          </div>
        )}

        <div className="text-center mt-4">
          <a
            href="/forgot-password"
            className="text-blue-500 hover:underline"
          >
            Forgot your password?
          </a>
        </div>

        <p className="text-center text-sm mt-4 text-black dark:text-white">
          Don't have an account?{" "}
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
