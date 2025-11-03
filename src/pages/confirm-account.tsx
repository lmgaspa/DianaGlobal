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

    let redirectTimer: any;

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
        let responseData: any = {};
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
      } catch (e: any) {
        setState({
          kind: "error",
          msg:
            e?.message ||
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

      let data: any = {};
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
    } catch (e: any) {
      setState({
        kind: "error",
        msg:
          e?.message ||
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
          title: "Verificando link...",
          icon: "⏳",
          message:
            "Aguarde enquanto verificamos seu link de confirmação.",
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          showSpinner: true,
        };

      case "success":
        return {
          title: "Email confirmado com sucesso!",
          icon: "✅",
          message:
            "Sua conta foi confirmada! Você será redirecionado para o login em breve.",
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
          message:
            "Este link de confirmação expirou. Links expiram em 45 minutos.",
          color: "text-orange-600",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
          showSpinner: false,
          actionButton: {
            text:
              resendState.cooldownSeconds > 0
                ? `Aguardar ${resendState.cooldownSeconds}s`
                : "Solicitar Novo Link",
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
          title: "Este link já foi usado",
          icon: "ℹ️",
          message:
            "Este link de confirmação já foi usado. Sua conta pode já estar confirmada.",
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
          message:
            "Este link de confirmação é inválido ou malformado.",
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          showSpinner: false,
          actionButton: {
            text:
              resendState.cooldownSeconds > 0
                ? `Aguardar ${resendState.cooldownSeconds}s`
                : "Solicitar Novo Link",
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
          title: "Erro na confirmação",
          icon: "⚠️",
          message: state.msg,
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          showSpinner: false,
          actionButton: {
            text:
              resendState.cooldownSeconds > 0
                ? `Aguardar ${resendState.cooldownSeconds}s`
                : "Tentar Novamente",
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
          title: "Token ausente",
          icon: "❓",
          message:
            "Token de confirmação não encontrado. Use o link do seu email.",
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
                  Enviando...
                </span>
              ) : (
                content.actionButton.text
              )}
            </button>

            {/* Info de tentativas restantes se existir */}
            {resendState.attemptsRemaining !== undefined &&
              resendState.attemptsRemaining > 0 && (
                <p className="text-xs text-gray-600">
                  Tentativas restantes: {resendState.attemptsRemaining}
                </p>
              )}

            {/* Info de cooldown */}
            {resendState.cooldownSeconds > 0 && (
              <p className="text-xs text-orange-600">
                Aguarde {resendState.cooldownSeconds} segundos antes de tentar
                novamente
              </p>
            )}
          </div>
        )}

        {/* Fallback link se não tem botão de ação */}
        {!content.actionButton && (
          <div className="text-sm">
            <a
              href="/verify-email"
              className="text-blue-600 hover:underline"
            >
              Solicitar novo link de confirmação
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
