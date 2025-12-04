// src/pages/check-email.tsx
"use client";

import { useRouter } from "next/router";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api"; // cliente centralizado (Authorization + CSRF interceptors)
import { getCookie } from "@/utils/cookies";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://dianagloballoginregister-52599bd07634.herokuapp.com";

// apaga cookie definindo expiração passada
function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax${
    typeof location !== "undefined" && location.protocol === "https:" ? ";Secure" : ""
  }`;
}

function maskEmail(e: string): string {
  if (!e || !e.includes("@")) return e;
  const [user, domain] = e.split("@");

  const leftUser = user.slice(0, 2);
  const maskedUser = leftUser + "*".repeat(Math.max(0, user.length - 2));

  const lastDot = domain.lastIndexOf(".");
  if (lastDot <= 0) {
    const keep = Math.min(2, domain.length);
    return `${maskedUser}@${domain.slice(0, keep)}${"*".repeat(
      Math.max(0, domain.length - keep)
    )}`;
  }

  const domName = domain.slice(0, lastDot);
  const tld = domain.slice(lastDot);
  const keepDom = Math.min(2, domName.length);
  const domMasked =
    domName.slice(0, keepDom) +
    "*".repeat(Math.max(0, domName.length - keepDom));
  return `${maskedUser}@${domMasked}${tld}`;
}

export default function CheckEmailPage() {
  const router = useRouter();

  // modo de tela: confirmação de conta ("confirm") ou reset de senha ("reset")
  const mode = useMemo<"reset" | "confirm">(() => {
    const m = (router.query.mode as string) || "confirm";
    return m === "reset" ? "reset" : "confirm";
  }, [router.query.mode]);

  const [email, setEmail] = useState("");
  const [masked, setMasked] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<boolean>(false);

  // Recupera o e-mail (query string primeiro; se não tiver usa cookie "pending")
  useEffect(() => {
    if (!router.isReady) return;

    let e = typeof router.query.email === "string" ? router.query.email : "";

    if (!e) {
      const cookieKey =
        mode === "reset" ? "dg.pendingResetEmail" : "dg.pendingEmail";
      const cached = getCookie(cookieKey) || "";
      if (cached) {
        e = cached;
        deleteCookie(cookieKey);
      }
    }

    setEmail(e);
    setMasked(e ? maskEmail(e) : "");
  }, [router.isReady, router.query.email, mode]);

  /**
   * Se for modo "confirm", tentamos checar status atual da conta:
   * GET /api/v1/auth/confirmed?email=...
   *
   * O backend pode responder de algumas formas diferentes,
   * então a gente tolera formatos antigos e novos:
   *  - { confirmed: true }
   *  - { status: "confirmed" }
   *  - "confirmed"
   */
  useEffect(() => {
    if (mode !== "confirm" || !email) return;

    async function run() {
      try {
        // Este endpoint deveria ser público, mas o backend pode estar exigindo autenticação
        // Por isso usamos fetch direto sem Authorization header (endpoint público)
        const res = await fetch(
          `${API_BASE}/api/v1/auth/confirmed?email=${encodeURIComponent(
            email
          )}`,
          { 
            credentials: "include",
            // Não enviar Authorization header - este endpoint deve ser público
            headers: {
              "Accept": "application/json",
            }
          }
        );

        let isOk = false;

        // Se retornar 401, o backend está exigindo autenticação (problema do backend)
        // Mas não é crítico - apenas não marcamos como confirmado
        if (res.status === 401) {
          console.warn("[check-email] Backend returned 401 for /confirmed endpoint - this should be a public endpoint");
          setConfirmed(false);
          return;
        }

        if (res.ok) {
          const ct = res.headers.get("content-type") || "";
          if (ct.includes("application/json")) {
            const d = await res.json() as { confirmed?: boolean; message?: string; status?: string } | null;

            // formato antigo
            if (typeof d?.confirmed === "boolean") {
              isOk = d.confirmed === true;
            }

            // formato novo
            const status = d?.status || (typeof d === "string" ? d : undefined);
            if (status === "confirmed") {
              isOk = true;
            }
          } else {
            // resposta pura em texto
            const txt = (await res.text()).trim().toLowerCase();
            if (txt === "confirmed") {
              isOk = true;
            }
          }
        }

        setConfirmed(isOk);
      } catch (err) {
        // se der erro de rede/etc, a gente só não marca confirmado
        console.warn("[check-email] Error checking confirmation status:", err);
      }
    }

    run();
  }, [email, mode]);

  /**
   * Reenvio de e-mail:
   *
   * - Se mode === "reset":
   *     POST /api/v1/auth/forgot-password
   *     body { email }
   *     -> reenvia link de reset
   *
   * - Se mode === "confirm":
   *     POST /api/v1/confirm/resend
   *     body { email, frontendBaseUrl }
   *     -> reenvia link de confirmação
   *
   * Aqui usamos `api` (Axios com interceptors), o que já injeta CSRF se tiver,
   * mas ambos endpoints toleram ser chamados sem CSRF explícito (forgot-password é público;
   * resend confirmation geralmente não exige login).
   */
  const resend = async () => {
    if (!email) return;

    setSending(true);
    setError(null);
    setMessage(null);

    try {
      const normalized = email.trim().toLowerCase();

      if (mode === "reset") {
        await api.post("/api/v1/auth/forgot-password", {
          email: normalized,
        });

        setMessage(
          "Password reset e-mail sent. Please check your inbox (and spam)."
        );
      } else {
        // Usar o mesmo endpoint que ResendBlock para consistência
        const res = await api.post("/api/v1/auth/confirm/resend", {
          email: normalized,
          frontendBaseUrl:
            (typeof window !== "undefined" && window.location.origin) ||
            "https://www.dianaglobal.com.br",
        });

        // Verificar se a conta já está confirmada (backend retorna 409 com status: "ALREADY_CONFIRMED")
        const data = res.data as { status?: string; message?: string } | undefined;
        if (res.status === 409 && data?.status === "ALREADY_CONFIRMED") {
          setConfirmed(true);
          setMessage("✅ Your account is already confirmed! You can sign in now.");
          // Redirecionar para login após alguns segundos
          setTimeout(() => {
            router.push("/login");
          }, 3000);
          return;
        }

        setMessage(
          "Confirmation e-mail sent. Please check your inbox (and spam)."
        );
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { status?: number; data?: { message?: string; detail?: string; status?: string } } };
      const res = axiosError?.response;
      const data = res?.data;

      // Tratar caso de conta já confirmada (409 CONFLICT)
      if (res?.status === 409 && data?.status === "ALREADY_CONFIRMED") {
        setConfirmed(true);
        setMessage("✅ Your account is already confirmed! You can sign in now.");
        // Redirecionar para login após alguns segundos
        setTimeout(() => {
          router.push("/login");
        }, 3000);
        return;
      }

      // tenta extrair mensagem amigável do backend
      const backendMsg =
        data?.message ||
        data?.detail ||
        (mode === "reset"
          ? "Failed to resend password reset e-mail."
          : "Failed to resend confirmation e-mail.");

      setError(backendMsg);
    } finally {
      setSending(false);
    }
  };

  const lead = confirmed
    ? "Your account is now confirmed."
    : mode === "reset"
    ? "We sent a password reset link to:"
    : "We sent an account confirmation link to:";

  const buttonText =
    mode === "reset"
      ? "Resend password reset email"
      : "Resend confirmation email";

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-black px-4">
      <div className="bg-white dark:bg-gray-900 p-8 rounded shadow max-w-md w-full text-center">
        <h1 className="text-2xl font-semibold text-black dark:text-white mb-4">
          Check your email
        </h1>

        <p className="text-gray-700 dark:text-gray-300 mb-2">{lead}</p>

        <p className="font-medium text-black dark:text-white mb-6">
          {masked || "your email"}
        </p>

        <p className="text-sm text-gray-500 mb-6">
          {!confirmed &&
            "If you can’t find it, please check your spam/junk folder."}
        </p>

        {message && (
          <p className="text-green-600 text-sm mb-3">{message}</p>
        )}
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

        {!confirmed && (
          <button
            onClick={resend}
            disabled={!email || sending || confirmed}
            className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:opacity-60"
          >
            {sending ? "Resending…" : buttonText}
          </button>
        )}
        
        {confirmed && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
            <p className="text-green-700 dark:text-green-300 text-sm">
              ✅ Your account is already confirmed. Redirecting to login...
            </p>
          </div>
        )}

        <div className="mt-6">
          <Link
            href="/login"
            className="inline-block px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 transition"
          >
            Go to Login
          </Link>
        </div>
      </div>
    </main>
  );
}
