// src/components/OtherComponents/ResendBlock.tsx
"use client";

import React from "react";
import { confirmResend, ConfirmResendPayload } from "@/lib/api";

type Props = {
  email: string;
  initial?: Partial<ConfirmResendPayload>;
  onAfterSend?: (payload: ConfirmResendPayload) => void;
  compact?: boolean; // se quiser usar inline
};

const LS_KEY = (email: string) => `confirmCooldown:${email.toLowerCase().trim()}`;

function secondsUntil(nextAllowedAt?: string) {
  if (!nextAllowedAt) return 0;
  const t = new Date(nextAllowedAt).getTime();
  const now = Date.now();
  const diff = Math.ceil((t - now) / 1000);
  return diff > 0 ? diff : 0;
}

export default function ResendBlock({ email, initial, onAfterSend, compact }: Props) {
  const [canResend, setCanResend] = React.useState<boolean>(!!initial?.canResend);
  const [cooldown, setCooldown] = React.useState<number>(() => {
    const savedIso = (typeof window !== "undefined") ? localStorage.getItem(LS_KEY(email)) || "" : "";
    const boot = savedIso ? secondsUntil(savedIso) : (initial?.cooldownSecondsRemaining ?? 0);
    return boot > 0 ? boot : 0;
  });
  const [attemptsToday, setAttemptsToday] = React.useState<number>(initial?.attemptsToday ?? 0);
  const [maxPerDay, setMaxPerDay] = React.useState<number>(initial?.maxPerDay ?? 5);
  const [loading, setLoading] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);

  // timer
  React.useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  // quando cooldown zera, permite reenvio
  React.useEffect(() => {
    if (cooldown === 0) setCanResend(true);
  }, [cooldown]);

  const handleResend = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const { status, data } = await confirmResend(email);
      setAttemptsToday(data.attemptsToday ?? attemptsToday);
      setMaxPerDay(data.maxPerDay ?? maxPerDay);

      if (status === 200) {
        setMsg("If an account exists for this e-mail, we sent the confirmation link.");
        // recomeça cooldown se o backend retornou o próximo horário
        if (data.nextAllowedAt) {
          if (typeof window !== "undefined") {
            localStorage.setItem(LS_KEY(email), data.nextAllowedAt);
          }
          setCooldown(secondsUntil(data.nextAllowedAt));
          setCanResend(Boolean(data.canResend));
        } else {
          // se não veio nextAllowedAt, usa o cooldownSecondsRemaining
          const secs = data.cooldownSecondsRemaining ?? 0;
          setCooldown(secs);
          setCanResend(Boolean(data.canResend) && secs === 0);
        }
      } else if (status === 429) {
        setMsg("Please wait before trying again.");
        const secs = data.cooldownSecondsRemaining ?? secondsUntil(data.nextAllowedAt);
        if (data.nextAllowedAt && typeof window !== "undefined") {
          localStorage.setItem(LS_KEY(email), data.nextAllowedAt);
        }
        setCooldown(secs > 0 ? secs : 60); // fallback
        setCanResend(false);
      } else if (status === 409 && data.status === "ALREADY_CONFIRMED") {
        setMsg("Your account is already confirmed. Please sign in.");
        setCanResend(false);
      } else {
        setMsg(data?.message || "Unable to resend now.");
      }

      onAfterSend?.(data);
    } catch (e: any) {
      setMsg("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const ButtonEl = (
    <button
      onClick={handleResend}
      disabled={loading || !canResend || cooldown > 0}
      className={`px-4 py-2 rounded-lg font-semibold border ${
        loading || cooldown > 0 || !canResend
          ? "opacity-60 cursor-not-allowed"
          : "hover:bg-zinc-900 hover:text-white"
      }`}
    >
      {loading
        ? "Sending..."
        : cooldown > 0
        ? `Resend available in ${Math.floor(cooldown / 60)
            .toString()
            .padStart(2, "0")}:${(cooldown % 60).toString().padStart(2, "0")}`
        : "Resend confirmation e-mail"}
    </button>
  );

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {ButtonEl}
        {msg && <span className="text-sm text-zinc-600">{msg}</span>}
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 border rounded-xl bg-zinc-50 dark:bg-zinc-900/30">
      <div className="mb-2 text-sm text-zinc-700 dark:text-zinc-200">
        Didn’t receive the confirmation link?
      </div>
      <div className="flex items-center gap-8 flex-wrap">
        {ButtonEl}
        <div className="text-xs text-zinc-600">
          Attempts today: <strong>{attemptsToday}</strong> / {maxPerDay}
        </div>
      </div>
      {msg && <div className="mt-2 text-sm text-zinc-700 dark:text-zinc-200">{msg}</div>}
    </div>
  );
}
