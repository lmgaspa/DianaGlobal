// src/pages/confirm-account.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success" }
  | { kind: "expired" }
  | { kind: "already_used" }
  | { kind: "invalid" }
  | { kind: "error"; msg: string };

type ResendState = {
  canResend: boolean;
  cooldownSeconds: number;
  attemptsRemaining?: number;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://dianagloballoginregister-52599bd07634.herokuapp.com";

export default function ConfirmAccountPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });
  const [resendState, setResendState] = useState<ResendState>({
    canResend: true,
    cooldownSeconds: 0,
  });
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState("");
  const didCallRef = useRef(false);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!router.isReady) return;
    const t =
      typeof router.query.token === "string"
        ? router.query.token
        : new URLSearchParams(window.location.search).get("token") ?? "";
    const e = typeof router.query.email === "string" 
      ? router.query.email 
      : new URLSearchParams(window.location.search).get("email") ?? "";
    
    if (t) setToken(t);
    if (e) setEmail(e);
  }, [router.isReady, router.query.token, router.query.email]);

  // Cooldown timer effect
  useEffect(() => {
    if (resendState.cooldownSeconds > 0) {
      cooldownTimerRef.current = setTimeout(() => {
        setResendState(prev => ({
          ...prev,
          cooldownSeconds: prev.cooldownSeconds - 1
        }));
      }, 1000);
    }
    return () => {
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
    };
  }, [resendState.cooldownSeconds]);

  // Main verification effect
  useEffect(() => {
    if (!token || didCallRef.current) return;
    didCallRef.current = true;

    let timer: any;

    (async () => {
      setState({ kind: "loading" });
      try {
        const res = await fetch(
          `${API_BASE}/api/confirm/verify?token=${encodeURIComponent(token)}`,
          { method: "POST" }
        );

        if (res.ok) {
          setState({ kind: "success" });
          timer = setTimeout(() => router.push("/login?confirmed=1"), 3000);
          return;
        }

        let responseData: any = {};
        try {
          const ct = res.headers.get("content-type") || "";
          if (ct.includes("application/json")) {
            responseData = await res.json();
          }
        } catch {
          /* ignore */
        }

        // Determine state based on HTTP status and response data
        switch (res.status) {
          case 200:
            setState({ kind: "success" });
            timer = setTimeout(() => router.push("/login?confirmed=1"), 3000);
            break;
          case 400:
            setState({ kind: "invalid" });
            break;
          case 409:
            if (responseData.status === "ALREADY_CONFIRMED") {
              setState({ kind: "already_used" });
            } else {
              setState({ kind: "already_used" });
            }
            break;
          case 410:
            setState({ kind: "expired" });
            break;
          default:
            setState({ 
              kind: "error", 
              msg: responseData.message || "Internal server error." 
            });
        }
      } catch (e: any) {
        setState({
          kind: "error",
          msg: e?.message || "We couldn't confirm right now. Please try again.",
        });
      }
    })();

    return () => clearTimeout(timer);
  }, [token, router]);

  // Resend confirmation function
  const handleResend = async () => {
    if (!email || isResending || !resendState.canResend || resendState.cooldownSeconds > 0) return;
    
    setIsResending(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/confirm/resend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        const data = await res.json();
        setResendState({
          canResend: data.canResend || false,
          cooldownSeconds: data.cooldownSecondsRemaining || 60,
          attemptsRemaining: data.attemptsRemaining,
        });
      } else if (res.status === 409) {
        // Account already confirmed
        setState({ kind: "already_used" });
      } else {
        const errorData = await res.json().catch(() => ({}));
        setState({ 
          kind: "error", 
          msg: errorData.message || "Failed to resend confirmation email." 
        });
      }
    } catch (e: any) {
      setState({
        kind: "error",
        msg: e?.message || "Network error. Please try again.",
      });
    } finally {
      setIsResending(false);
    }
  };

  // Get UI content based on state
  const getStateContent = () => {
    switch (state.kind) {
      case "loading":
        return {
          title: "Verificando link...",
          icon: "⏳",
          message: "Aguarde enquanto verificamos seu link de confirmação.",
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          showSpinner: true,
        };
      
      case "success":
        return {
          title: "Email confirmado com sucesso!",
          icon: "✅",
          message: "Sua conta foi confirmada! Você será redirecionado para o login em breve.",
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          showSpinner: false,
          actionButton: {
            text: "Fazer Login",
            onClick: () => router.push("/login"),
            className: "bg-green-600 hover:bg-green-700 text-white",
          },
        };
      
      case "expired":
        return {
          title: "Este link expirou",
          icon: "⏰",
          message: "Este link de confirmação expirou. Links expiram em 45 minutos.",
          color: "text-orange-600",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
          showSpinner: false,
          actionButton: {
            text: resendState.cooldownSeconds > 0 
              ? `Aguardar ${resendState.cooldownSeconds}s` 
              : "Solicitar Novo Link",
            onClick: handleResend,
            disabled: isResending || resendState.cooldownSeconds > 0 || !resendState.canResend,
            className: "bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50",
          },
        };
      
      case "already_used":
        return {
          title: "Este link já foi usado",
          icon: "ℹ️",
          message: "Este link de confirmação já foi usado. Sua conta pode já estar confirmada.",
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          showSpinner: false,
          actionButton: {
            text: "Tentar Login",
            onClick: () => router.push("/login"),
            className: "bg-blue-600 hover:bg-blue-700 text-white",
          },
        };
      
      case "invalid":
        return {
          title: "Link inválido",
          icon: "❌",
          message: "Este link de confirmação é inválido ou malformado.",
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          showSpinner: false,
          actionButton: {
            text: resendState.cooldownSeconds > 0 
              ? `Aguardar ${resendState.cooldownSeconds}s` 
              : "Solicitar Novo Link",
            onClick: handleResend,
            disabled: isResending || resendState.cooldownSeconds > 0 || !resendState.canResend,
            className: "bg-red-600 hover:bg-red-700 text-white disabled:opacity-50",
          },
        };
      
      case "error":
        return {
          title: "Erro na confirmação",
          icon: "⚠️",
          message: state.msg,
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          showSpinner: false,
          actionButton: {
            text: resendState.cooldownSeconds > 0 
              ? `Aguardar ${resendState.cooldownSeconds}s` 
              : "Tentar Novamente",
            onClick: handleResend,
            disabled: isResending || resendState.cooldownSeconds > 0 || !resendState.canResend,
            className: "bg-red-600 hover:bg-red-700 text-white disabled:opacity-50",
          },
        };
      
      default:
        return {
          title: "Token ausente",
          icon: "❓",
          message: "Token de confirmação não encontrado. Use o link do seu email.",
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          showSpinner: false,
        };
    }
  };

  const content = getStateContent();

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-black px-4 py-8">
      <div className={`${content.bgColor} ${content.borderColor} border rounded-lg p-8 max-w-md w-full text-center shadow-sm`}>
        {/* Icon */}
        <div className="text-6xl mb-4">
          {content.showSpinner ? (
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          ) : (
            content.icon
          )}
        </div>

        {/* Title */}
        <h1 className={`text-2xl font-semibold mb-4 ${content.color}`}>
          {content.title}
        </h1>

        {/* Message */}
        <p className={`mb-6 text-sm ${content.color}`}>
          {content.message}
        </p>

        {/* Action Button */}
        {content.actionButton && (
          <div className="space-y-3">
            <button
              onClick={content.actionButton.onClick}
              disabled={content.actionButton.disabled}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${content.actionButton.className}`}
            >
              {isResending ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Enviando...
                </span>
              ) : (
                content.actionButton.text
              )}
            </button>

            {/* Additional Info */}
            {resendState.attemptsRemaining !== undefined && resendState.attemptsRemaining > 0 && (
              <p className="text-xs text-gray-600">
                Tentativas restantes: {resendState.attemptsRemaining}
              </p>
            )}

            {/* Rate Limit Info */}
            {resendState.cooldownSeconds > 0 && (
              <p className="text-xs text-orange-600">
                Aguarde {resendState.cooldownSeconds} segundos antes de tentar novamente
              </p>
            )}
          </div>
        )}

        {/* Fallback Link */}
        {!content.actionButton && (
          <div className="text-sm">
            <a href="/verify-email" className="text-blue-600 hover:underline">
              Solicitar novo link de confirmação
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
