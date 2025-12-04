// src/pages/verify-email.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://dianagloballoginregister-52599bd07634.herokuapp.com";

/**
 * Resposta esperada do backend em /api/v1/auth/confirm/resend
 * (ela já aparece também no fluxo de login quando dá EMAIL_UNCONFIRMED)
 */
type ResendMeta = {
  status?: "CONFIRMATION_EMAIL_SENT" | "ALREADY_CONFIRMED" | string;
  error?: "TOO_MANY_REQUESTS" | string;
  message?: string;
  canResend?: boolean;
  cooldownSecondsRemaining?: number;
  attemptsToday?: number;
  maxPerDay?: number;
  nextAllowedAt?: string; // ISO
};

/** chave localStorage onde guardamos cooldown por e-mail */
const lsKey = (email: string) =>
  `dg.confirmCooldown:${email.trim().toLowerCase()}`;

/** calcula quantos segundos faltam até uma data futura ISO */
const secondsUntil = (iso?: string) => {
  if (!iso) return 0;
  const t = new Date(iso).getTime();
  const diff = Math.ceil((t - Date.now()) / 1000);
  return diff > 0 ? diff : 0;
};

export default function VerifyEmailPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [busy, setBusy] = useState(false);

  const [msg, setMsg] = useState<string | null>(null);

  const [attemptsToday, setAttemptsToday] = useState<number>(0);
  const [maxPerDay, setMaxPerDay] = useState<number>(5);

  // 1. Inicializa e-mail a partir da query string e restaura cooldown
  useEffect(() => {
    if (!router.isReady) return;

    // tenta pegar ?email=... da URL
    const q = typeof router.query.email === "string" ? router.query.email : "";

    if (q) {
      setEmail(q);

      // Se já tínhamos salvo "próximo horário permitido" desse e-mail,
      // recarrega isso pra respeitar cooldown entre reloads.
      try {
        const saved = localStorage.getItem(lsKey(q));
        if (saved) {
          setCooldown(secondsUntil(saved));
        }
      } catch {
        /* ignore storage errors */
      }
    }
  }, [router.isReady, router.query.email]);

  // 2. Tick do cooldown (1s)
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(
      () => setCooldown((s) => (s > 0 ? s - 1 : 0)),
      1000
    );
    return () => clearInterval(id);
  }, [cooldown]);

  /**
   * Fluxo de reenviar confirmação:
   *
   * Chama o backend:
   *   POST /api/v1/auth/confirm/resend
   *   body: { email }
   *
   * O backend responde sempre algo "seguro" (não vaza se existe conta),
   * e também devolve metadados de cooldown / attempts, etc.
   *
   * Observação: esse endpoint não exige estar autenticado e não exige CSRF.
   */
  const onResend = async () => {
    const normalized = email.trim().toLowerCase();
    if (!normalized) return;

    setBusy(true);
    setMsg(null);

    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/confirm/resend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include", // ok manter, mesmo público
        body: JSON.stringify({ email: normalized }),
      });

      let data: ResendMeta = {};
      try {
        data = (await res.json()) as ResendMeta;
      } catch {
        data = {};
      }

      // 200 OK => e-mail (talvez) reenviado
      if (res.status === 200) {
        setMsg(
          "If an account exists for this e-mail, we sent a confirmation link."
        );

        // métricas de tentativa / limite diário
        setAttemptsToday(data.attemptsToday ?? 0);
        setMaxPerDay(data.maxPerDay ?? 5);

        // cooldown persistente
        if (data.nextAllowedAt) {
          try {
            localStorage.setItem(lsKey(normalized), data.nextAllowedAt);
          } catch {
            /* ignore */
          }
          setCooldown(secondsUntil(data.nextAllowedAt));
        } else if (
          typeof data.cooldownSecondsRemaining === "number" &&
          data.cooldownSecondsRemaining > 0
        ) {
          setCooldown(data.cooldownSecondsRemaining);
        } else {
          setCooldown(0);
        }

        return;
      }

      // 429 TOO_MANY_REQUESTS -> atingiu o limite agora
      if (res.status === 429) {
        setMsg(data?.message || "Please wait before trying again.");

        const secs =
          typeof data?.cooldownSecondsRemaining === "number"
            ? data.cooldownSecondsRemaining
            : secondsUntil(data?.nextAllowedAt);

        if (data?.nextAllowedAt) {
          try {
            localStorage.setItem(lsKey(normalized), data.nextAllowedAt);
          } catch {
            /* ignore */
          }
        }

        setCooldown(secs > 0 ? secs : 60); // fallback defensivo
        setAttemptsToday(data.attemptsToday ?? attemptsToday);
        setMaxPerDay(data.maxPerDay ?? maxPerDay);
        return;
      }

      // 409 CONFLICT + status === "ALREADY_CONFIRMED"
      // quer dizer: a conta já está confirmada
      if (res.status === 409 && data.status === "ALREADY_CONFIRMED") {
        setMsg("Your account is already confirmed. You can sign in.");
        setCooldown(0);
        // aqui faz sentido oferecer login direto, mas mantemos só a mensagem
        return;
      }

      // fallback genérico pra qualquer outro status
      setMsg(data?.message || data?.error || `Error ${res.status}`);
    } catch (e: unknown) {
      const error = e as { message?: string };
      setMsg(error?.message || "Network error.");
    } finally {
      setBusy(false);
    }
  };

  // UI
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-black px-4">
      <div className="bg-white dark:bg-gray-900 p-8 rounded shadow max-w-md w-full">
        <h1 className="text-2xl font-semibold text-black dark:text-white mb-3">
          Verify your e-mail
        </h1>

        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
          We’ve sent a confirmation link. Check your inbox and spam folder.
          If needed, you can resend it below.
        </p>

        <div className="space-y-3">
          {/* input controlado do e-mail */}
          <input
            type="email"
            className="w-full p-2 border border-gray-300 rounded text-black"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* botão de reenviar */}
          <button
            onClick={onResend}
            disabled={busy || cooldown > 0 || !email.trim()}
            className="w-full py-2 px-4 bg-zinc-900 text-white rounded hover:opacity-90 transition disabled:opacity-60"
          >
            {busy
              ? "Sending..."
              : cooldown > 0
              ? `Resend in ${Math.floor(cooldown / 60)
                  .toString()
                  .padStart(2, "0")}:${(cooldown % 60)
                  .toString()
                  .padStart(2, "0")}`
              : "Resend confirmation email"}
          </button>

          {/* mensagem de status / erro */}
          {msg && (
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {msg}
            </div>
          )}

          {/* tentativa diária */}
          <div className="text-xs text-gray-500">
            Attempts today:{" "}
            <strong>{attemptsToday}</strong> / {maxPerDay}
          </div>
        </div>

        <div className="mt-6 text-sm text-center">
          <Link
            href="/login"
            className="text-blue-500 hover:underline"
          >
            Back to login
          </Link>
        </div>
      </div>
    </main>
  );
}
