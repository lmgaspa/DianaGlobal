// src/pages/verify-email.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://dianagloballoginregister-52599bd07634.herokuapp.com";

type ResendMeta = {
  status?: "CONFIRMATION_EMAIL_SENT" | "ALREADY_CONFIRMED";
  error?: "TOO_MANY_REQUESTS" | string;
  message?: string;
  canResend?: boolean;
  cooldownSecondsRemaining?: number;
  attemptsToday?: number;
  maxPerDay?: number;
  nextAllowedAt?: string;
};

const lsKey = (email: string) => `dg.confirmCooldown:${email.trim().toLowerCase()}`;
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

  useEffect(() => {
    if (!router.isReady) return;
    const q = typeof router.query.email === "string" ? router.query.email : "";
    if (q) {
      setEmail(q);
      // puxa cooldown de LS se existir
      const saved = localStorage.getItem(lsKey(q));
      if (saved) setCooldown(secondsUntil(saved));
    }
  }, [router.isReady, router.query.email]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const onResend = async () => {
    const normalized = email.trim().toLowerCase();
    if (!normalized) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`${API_BASE}/api/auth/confirm/resend`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: normalized }),
      });

      const data: ResendMeta = await res.json().catch(() => ({}));

      if (res.status === 200) {
        setMsg("If an account exists for this e-mail, we sent a confirmation link.");
        setAttemptsToday(data.attemptsToday ?? 0);
        setMaxPerDay(data.maxPerDay ?? 5);
        if (data.nextAllowedAt) {
          localStorage.setItem(lsKey(normalized), data.nextAllowedAt);
          setCooldown(secondsUntil(data.nextAllowedAt));
        } else if (typeof data.cooldownSecondsRemaining === "number") {
          setCooldown(data.cooldownSecondsRemaining);
        }
      } else if (res.status === 429) {
        setMsg(data?.message || "Please wait before trying again.");
        const secs =
          typeof data?.cooldownSecondsRemaining === "number"
            ? data.cooldownSecondsRemaining
            : secondsUntil(data?.nextAllowedAt);
        if (data?.nextAllowedAt) localStorage.setItem(lsKey(normalized), data.nextAllowedAt);
        setCooldown(secs > 0 ? secs : 60);
        setAttemptsToday(data.attemptsToday ?? attemptsToday);
        setMaxPerDay(data.maxPerDay ?? maxPerDay);
      } else if (res.status === 409 && data.status === "ALREADY_CONFIRMED") {
        setMsg("Your account is already confirmed. You can sign in.");
        setCooldown(0);
      } else {
        setMsg(data?.message || data?.error || `Error ${res.status}`);
      }
    } catch (e: any) {
      setMsg(e?.message || "Network error.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-black px-4">
      <div className="bg-white dark:bg-gray-900 p-8 rounded shadow max-w-md w-full">
        <h1 className="text-2xl font-semibold text-black dark:text-white mb-3">Verify your e-mail</h1>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
          We’ve sent a confirmation link. Check your inbox and spam folder. If needed, resend below.
        </p>

        <div className="space-y-3">
          <input
            type="email"
            className="w-full p-2 border border-gray-300 rounded text-black"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

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
                  .padStart(2, "0")}:${(cooldown % 60).toString().padStart(2, "0")}`
              : "Resend confirmation email"}
          </button>

          {msg && <div className="text-sm text-gray-700 dark:text-gray-300">{msg}</div>}
          <div className="text-xs text-gray-500">
            Attempts today: <strong>{attemptsToday}</strong> / {maxPerDay}
          </div>
        </div>

        <div className="mt-6 text-sm text-center">
          <a href="/login" className="text-blue-500 hover:underline">
            Back to login
          </a>
        </div>
      </div>
    </main>
  );
}
