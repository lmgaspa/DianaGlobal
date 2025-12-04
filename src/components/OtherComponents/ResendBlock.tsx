// src/components/OtherComponents/ResendBlock.tsx
"use client";

import React from "react";
import { useRouter } from "next/router";
import Link from "next/link";
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
  const router = useRouter();
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
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [isRedirecting, setIsRedirecting] = React.useState(false);

  // Function to redirect to login after confirmation
  const redirectToLogin = () => {
    setIsRedirecting(true);
    setMsg("🔄 Redirecting to login...");
    setTimeout(() => {
      router.push("/login");
    }, 3000);
  };

  // Verificação inicial de status quando o componente monta
  React.useEffect(() => {
    if (!email || isInitialized) return;
    
    const checkInitialStatus = async () => {
      try {
        const { status, data } = await confirmResend(email);
        if (status === 409 && data.status === "ALREADY_CONFIRMED") {
          setMsg("✅ Your account is already confirmed! Redirecting to login...");
          setCanResend(false);
          redirectToLogin();
        }
        setIsInitialized(true);
      } catch {
        // Ignora erros na verificação inicial
        setIsInitialized(true);
      }
    };

    checkInitialStatus();
  }, [email, isInitialized]);

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
    // Local email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMsg("❌ Invalid email. Please check the email address format.");
      return;
    }

    setLoading(true);
    setMsg(null);
    try {
      const { status, data } = await confirmResend(email);
      setAttemptsToday(data.attemptsToday ?? attemptsToday);
      setMaxPerDay(data.maxPerDay ?? maxPerDay);

      if (status === 200) {
        setMsg("📧 Confirmation email sent! Please check your inbox and spam folder.");
        // restart cooldown if backend returned next allowed time
        if (data.nextAllowedAt) {
          if (typeof window !== "undefined") {
            localStorage.setItem(LS_KEY(email), data.nextAllowedAt);
          }
          setCooldown(secondsUntil(data.nextAllowedAt));
          setCanResend(Boolean(data.canResend));
        } else {
          // if nextAllowedAt not provided, use cooldownSecondsRemaining
          const secs = data.cooldownSecondsRemaining ?? 0;
          setCooldown(secs);
          setCanResend(Boolean(data.canResend) && secs === 0);
        }
      } else if (status === 429) {
        setMsg("⏳ Too many attempts. Please wait before trying again.");
        const secs = data.cooldownSecondsRemaining ?? secondsUntil(data.nextAllowedAt);
        if (data.nextAllowedAt && typeof window !== "undefined") {
          localStorage.setItem(LS_KEY(email), data.nextAllowedAt);
        }
        setCooldown(secs > 0 ? secs : 60); // fallback
        setCanResend(false);
      } else if (status === 409 && data.status === "ALREADY_CONFIRMED") {
        setMsg("✅ Your account is already confirmed! Redirecting to login...");
        setCanResend(false);
        redirectToLogin();
      } else if (status === 429) {
        setMsg("⏳ Too many attempts. Please wait before trying again.");
        setCanResend(false);
      } else {
        setMsg(data?.message || "❌ Could not resend at this time.");
      }

      onAfterSend?.(data);
    } catch {
      setMsg("🌐 Connection error. Please check your internet connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const ButtonEl = (
    <button
      onClick={handleResend}
      disabled={loading || !canResend || cooldown > 0 || isRedirecting}
      className={`px-4 py-2 rounded-lg font-semibold border transition-colors ${
        loading || cooldown > 0 || !canResend || isRedirecting
          ? "opacity-60 cursor-not-allowed bg-gray-100 text-gray-500"
          : msg && msg.includes("already confirmed")
          ? "bg-green-100 text-green-700 border-green-300 hover:bg-green-200"
          : "bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200"
      }`}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
          Sending...
        </span>
      ) : isRedirecting ? (
        <span className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
          Redirecting...
        </span>
      ) : msg && msg.includes("already confirmed") ? (
        <span className="flex items-center gap-2">
          <span className="text-green-600">✓</span>
          Account Confirmed
        </span>
      ) : cooldown > 0 ? (
        <span className="flex items-center gap-2">
          <div className="animate-pulse rounded-full h-4 w-4 bg-orange-400"></div>
          Wait {Math.floor(cooldown / 60)
            .toString()
            .padStart(2, "0")}:{(cooldown % 60).toString().padStart(2, "0")}
        </span>
      ) : (
        "Resend Confirmation"
      )}
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
      <div className="mb-3 text-sm text-zinc-700 dark:text-zinc-200">
        Didn&apos;t receive the confirmation link?
      </div>
      
      <div className="flex items-center gap-6 flex-wrap mb-3">
        {ButtonEl}
        
        <div className="flex items-center gap-4 text-xs text-zinc-600">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
            <span>Attempts today: <strong>{attemptsToday}</strong> / {maxPerDay}</span>
          </div>
          
          {cooldown > 0 && (
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></span>
              <span>Cooldown active</span>
            </div>
          )}
          
          {msg && msg.includes("already confirmed") && (
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              <span>Account verified</span>
            </div>
          )}
        </div>
      </div>
      
      {msg && (
        <div className={`text-sm p-3 rounded-lg ${
          msg.includes("already confirmed") || msg.includes("Redirecting")
            ? "bg-green-50 text-green-700 border border-green-200" 
            : msg.includes("wait") || msg.includes("cooldown")
            ? "bg-orange-50 text-orange-700 border border-orange-200"
            : "bg-blue-50 text-blue-700 border border-blue-200"
        }`}>
          <div className="flex items-center justify-between">
            <span>{msg}</span>
            {msg.includes("already confirmed") && !isRedirecting && (
              <Link 
                href="/login" 
                className="ml-2 text-green-600 hover:text-green-800 underline font-medium"
              >
                Sign In →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
