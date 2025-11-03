// src/pages/email-change/confirm.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://dianagloballoginregister-52599bd07634.herokuapp.com";

type ViewState =
  | { kind: "loading"; detail?: string }
  | { kind: "ok"; detail: string }
  | { kind: "err"; detail: string };

export default function EmailChangeConfirmPage(): JSX.Element {
  const router = useRouter();

  const [state, setState] = useState<ViewState>({
    kind: "loading",
    detail: "Please wait…",
  });

  // usamos um ref pra poder limpar o timeout de redirect
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!router.isReady) return;

    // tenta extrair token da query (?token=...) ou da URL
    const token =
      (typeof router.query.token === "string" && router.query.token) ||
      new URLSearchParams(window.location.search).get("token") ||
      "";

    if (!token) {
      setState({
        kind: "err",
        detail: "Missing token. Please use the link from your e-mail.",
      });
      return;
    }

    // auto-exec async IIFE
    (async () => {
      try {
        // POST /api/v1/auth/email/change-confirm?token=...
        // (teu backend aceita tanto GET quanto POST, mas aqui padronizamos POST)
        const res = await fetch(
          `${API_BASE}/api/v1/auth/email/change-confirm?token=${encodeURIComponent(
            token
          )}`,
          {
            method: "POST",
            headers: { Accept: "application/json" },
            credentials: "include",
          }
        );

        if (res.ok) {
          // sucesso → e-mail trocado
          const successMsg =
            "Your e-mail has been updated. A confirmation message was sent to your new address. " +
            "You’ll be redirected to Login…";

          setState({ kind: "ok", detail: successMsg });

          // redireciona após um curto delay (mesma UX de confirm-account)
          timerRef.current = setTimeout(() => {
            router.replace("/login");
          }, 3000);

          return;
        }

        // se não foi ok, tenta extrair mensagem amigável do backend
        let msg = "";
        try {
          const ct = res.headers.get("content-type") || "";
          if (ct.includes("application/json")) {
            const j = await res.json();
            msg = j?.message || j?.detail || "";
          } else {
            msg = (await res.text()) || "";
          }
        } catch {
          /* ignore parse errors */
        }

        // fallback de status comum
        if (!msg) {
          msg =
            res.status === 410
              ? "This link has expired. Please request a new e-mail change."
              : "Invalid or expired link.";
        }

        setState({ kind: "err", detail: msg });
      } catch (e: any) {
        setState({
          kind: "err",
          detail:
            e?.message ||
            "Could not confirm right now. Please try again later.",
        });
      }
    })();

    // cleanup: se sair da tela antes do redirect, limpa o timeout
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [router.isReady, router.query.token, router]);

  // título dinâmico bonitinho
  const title =
    state.kind === "ok"
      ? "Email change confirmed"
      : state.kind === "err"
      ? "Email change failed"
      : "Confirming…";

  // cor/estilo do texto principal
  const textClass =
    state.kind === "ok"
      ? "text-green-600"
      : state.kind === "err"
      ? "text-red-600"
      : "text-zinc-600 dark:text-zinc-300";

  return (
    <main className="relative min-h-screen bg-gray-100 px-4 py-8 dark:bg-black">
      {/* Back link fixo canto superior esquerdo (segue teu padrão de navegação simples) */}
      <a
        href="/login"
        className="fixed left-4 top-4 inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      >
        ← Back
      </a>

      <div className="mx-auto w-full max-w-md rounded-lg border border-zinc-300 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <h1 className="mb-3 text-center text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          {title}
        </h1>

        <p className={`text-center text-sm ${textClass}`}>
          {state.detail || "Please wait…"}
        </p>

        {/* Se falhou, oferece botão manual pra login.
            Se deu certo, a gente já vai redirecionar sozinho. */}
        {state.kind !== "ok" && (
          <div className="mt-6 flex justify-center gap-3">
            <a
              href="/login"
              className="rounded-md bg-zinc-800 px-4 py-2 text-white hover:bg-zinc-900 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-white"
            >
              Go to Login
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
