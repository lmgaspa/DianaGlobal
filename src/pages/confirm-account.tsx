// src/pages/confirm-account.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

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
  const [email, setEmail] = useState("");

  const [state, setState] = useState<State>({ kind: "idle" });

  const [resendState, setResendState] = useState<ResendState>({
    canResend: true,
    cooldownSeconds: 0,
  });

  const [isResending, setIsResending] = useState(false);

  const didCallRef = useRef(false);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Lê token e email da URL (query param ou fallback manual)
  useEffect(() => {
    if (!router.isReady) return;

    const t =
      typeof router.query.token === "string"
        ? router.query.token
        : new URLSearchParams(window.location.search).get("token") ?? "";

    const e =
      typeof router.query.email === "string"
        ? router.query.email
        : new URLSearchParams(window.location.search).get("email") ?? "";

    if (t) setToken(t);
    if (e) setEmail(e);
  }, [router.isReady, router.query.token, router.query.email]);

  // Decrementa cooldown 1s/1s
  useEffect(() => {
    if (resendState.cooldownSeconds > 0) {
      cooldownTimerRef.current = setTimeout(() => {
        setResendState((prev) => ({
          ...prev,
          cooldownSeconds: prev.cooldownSeconds - 1,
        }));
      }, 1000);
    }
    return () => {
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
    };
  }, [resendState.cooldownSeconds]);

  // Verifica token de confirmação assim que temos token
  useEffect(() => {
    if (!token || didCallRef.current) return;
    didCallRef.current = true;

    let redirectTimer: NodeJS.Timeout | undefined;

    (async () => {
      setState({ kind: "loading" });

      try {
        // (1) NOVA ROTA VERSIONADA
        // Backend agora expõe confirm via /api/v1/confirm/verify
        // e aceita POST com body { token }, NÃO precisamos mais forçar query param.
        const res = await fetch(`${API_BASE}/api/v1/confirm/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ token }),
          credentials: "include",
        });

        // tenta ler JSON se existir (p/ extrair status como ALREADY_CONFIRMED)
        let responseData: { status?: string; message?: string; detail?: string } = {};
        try {
          const ct = res.headers.get("content-type") || "";
          if (ct.includes("application/json")) {
            responseData = await res.json();
          }
        } catch {
          /* ignore parse fail */
        }

        // mapeia status HTTP -> nosso State.kind
        if (res.ok || res.status === 200) {
          setState({ kind: "success" });
          // redireciona depois de uns segundos pro login com flag
          redirectTimer = setTimeout(() => {
            router.push("/login?confirmed=1");
          }, 3000);
          return;
        }

        switch (res.status) {
          case 400:
            // token inválido/malformado
            setState({ kind: "invalid" });
            break;

          case 409:
            // conta já confirmada
            // (o backend pode devolver status "ALREADY_CONFIRMED")
            if (responseData?.status === "ALREADY_CONFIRMED") {
              setState({ kind: "already_used" });
            } else {
              setState({ kind: "already_used" });
            }
            break;

          case 410:
            // token expirado
            setState({ kind: "expired" });
            break;

          default:
            // erro interno / erro desconhecido
            setState({
              kind: "error",
              msg:
                responseData?.message ||
                responseData?.detail ||
                "Internal server error.",
            });
            break;
        }
      } catch (e: unknown) {
        const error = e as { message?: string };
        setState({
          kind: "error",
          msg:
            error?.message ||
            "We couldn't confirm right now. Please try again.",
        });
      }
    })();

    return () => clearTimeout(redirectTimer);
  }, [token, router]);

  // Reenvio de email de confirmação
  const handleResend = async () => {
    // só permite se temos email e não estamos em cooldown
    if (
      !email ||
      isResending ||
      !resendState.canResend ||
      resendState.cooldownSeconds > 0
    ) {
      return;
    }

    setIsResending(true);

    try {
      // (2) NOVA ROTA VERSIONADA
      // Agora o backend expõe resend em /api/v1/confirm/resend
      // e espera body { email, frontendBaseUrl }
      const res = await fetch(`${API_BASE}/api/v1/confirm/resend`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          email,
          frontendBaseUrl:
            (typeof window !== "undefined" && window.location.origin) ||
            "https://www.dianaglobal.com.br",
        }),
        credentials: "include",
      });

      let data: { status?: string; message?: string; detail?: string; canResend?: boolean; cooldownSecondsRemaining?: number; attemptsToday?: number; maxPerDay?: number; attemptsRemaining?: number } = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (res.ok || res.status === 200) {
        // servidor respondeu sucesso do reenviar
        // Ele deve devolver metadados: cooldownSecondsRemaining, canResend, attemptsToday/maxPerDay...
        const cooldown =
          typeof data.cooldownSecondsRemaining === "number"
            ? data.cooldownSecondsRemaining
            : 60;

        setResendState({
          canResend: Boolean(data.canResend ?? true),
          cooldownSeconds: cooldown,
          attemptsRemaining:
            data.attemptsRemaining !== undefined
              ? data.attemptsRemaining
              : undefined,
        });

        // se a conta já estava confirmada, podemos atualizar a UI também
        if (data.status === "ALREADY_CONFIRMED") {
          setState({ kind: "already_used" });
        }
      } else if (res.status === 409) {
        // 409 no fluxo de confirmação normalmente significa:
        // "ALREADY_CONFIRMED"
        if (data?.status === "ALREADY_CONFIRMED") {
          setState({ kind: "already_used" });
        } else {
          setState({
            kind: "error",
            msg:
              data?.message ||
              data?.detail ||
              "This account may already be confirmed.",
          });
        }
      } else if (res.status === 429) {
        // limite de tentativas / throttling
        const cooldown =
          typeof data.cooldownSecondsRemaining === "number"
            ? data.cooldownSecondsRemaining
            : 60;

        setResendState({
          canResend: false,
          cooldownSeconds: cooldown,
          attemptsRemaining:
            data.attemptsRemaining !== undefined
              ? data.attemptsRemaining
              : undefined,
        });

        // não troca state.kind pra erro fatal, só mostra cooldown no botão
      } else {
        // erro genérico no resend
        setState({
          kind: "error",
          msg:
            data?.message ||
            data?.detail ||
            "Failed to resend confirmation email.",
        });
      }
    } catch (e: unknown) {
      const error = e as { message?: string };
      setState({
        kind: "error",
        msg:
          error?.message ||
          "Network error. Please try again.",
      });
    } finally {
      setIsResending(false);
    }
  };

  // UI state machine -> define bloco visual
  const getStateContent = () => {
    switch (state.kind) {
      case "loading":
        return {
          title: "Verifying link...",
          icon: "⏳",
          message:
            "Please wait while we verify your confirmation link.",
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          showSpinner: true,
        };

      case "success":
        return {
          title: "Email confirmed successfully!",
          icon: "✅",
          message:
            "Your account has been confirmed! You will be redirected to login shortly.",
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          showSpinner: false,
          actionButton: {
            text: "Sign In",
            onClick: () => router.push("/login"),
            className: "bg-green-600 hover:bg-green-700 text-white",
          },
        };

      case "expired":
        return {
          title: "This link has expired",
          icon: "⏰",
          message:
            "This confirmation link has expired. Links expire after 45 minutes.",
          color: "text-orange-600",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
          showSpinner: false,
          actionButton: {
            text:
              resendState.cooldownSeconds > 0
                ? `Wait ${resendState.cooldownSeconds}s`
                : "Request New Link",
            onClick: handleResend,
            disabled:
              isResending ||
              resendState.cooldownSeconds > 0 ||
              !resendState.canResend,
            className:
              "bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50",
          },
        };

      case "already_used":
        return {
          title: "This link has already been used",
          icon: "ℹ️",
          message:
            "This confirmation link has already been used. Your account may already be confirmed.",
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          showSpinner: false,
          actionButton: {
            text: "Try Sign In",
            onClick: () => router.push("/login"),
            className: "bg-blue-600 hover:bg-blue-700 text-white",
          },
        };

      case "invalid":
        return {
          title: "Invalid link",
          icon: "❌",
          message:
            "This confirmation link is invalid or malformed.",
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          showSpinner: false,
          actionButton: {
            text:
              resendState.cooldownSeconds > 0
                ? `Wait ${resendState.cooldownSeconds}s`
                : "Request New Link",
            onClick: handleResend,
            disabled:
              isResending ||
              resendState.cooldownSeconds > 0 ||
              !resendState.canResend,
            className:
              "bg-red-600 hover:bg-red-700 text-white disabled:opacity-50",
          },
        };

      case "error":
        return {
          title: "Confirmation error",
          icon: "⚠️",
          message: state.msg,
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          showSpinner: false,
          actionButton: {
            text:
              resendState.cooldownSeconds > 0
                ? `Wait ${resendState.cooldownSeconds}s`
                : "Try Again",
            onClick: handleResend,
            disabled:
              isResending ||
              resendState.cooldownSeconds > 0 ||
              !resendState.canResend,
            className:
              "bg-red-600 hover:bg-red-700 text-white disabled:opacity-50",
          },
        };

      default:
        return {
          title: "Token missing",
          icon: "❓",
          message:
            "Confirmation token not found. Please use the link from your email.",
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
      <div
        className={`${content.bgColor} ${content.borderColor} border rounded-lg p-8 max-w-md w-full text-center shadow-sm`}
      >
        {/* Icon / Spinner */}
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
        <p className={`mb-6 text-sm ${content.color}`}>{content.message}</p>

        {/* Action Button (reenviar / login rápido etc) */}
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
                  Sending...
                </span>
              ) : (
                content.actionButton.text
              )}
            </button>

            {/* Info about remaining attempts if available */}
            {resendState.attemptsRemaining !== undefined &&
              resendState.attemptsRemaining > 0 && (
                <p className="text-xs text-gray-600">
                  Remaining attempts: {resendState.attemptsRemaining}
                </p>
              )}

            {/* Cooldown info */}
            {resendState.cooldownSeconds > 0 && (
              <p className="text-xs text-orange-600">
                Please wait {resendState.cooldownSeconds} seconds before trying again
              </p>
            )}
          </div>
        )}

        {/* Fallback link if no action button */}
        {!content.actionButton && (
          <div className="text-sm">
            <Link
              href="/verify-email"
              className="text-blue-600 hover:underline"
            >
              Request new confirmation link
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
