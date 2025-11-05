// src/pages/protected/change-email.tsx
"use client";

import React, { useMemo, useRef, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import BackButton from "@/components/common/BackButton";
import { api } from "@/lib/api";
import PasswordRequiredGate from "@/components/PasswordRequiredGate";

type Msg = { type: "ok" | "err"; text: string } | null;

export default function ChangeEmailPage(): JSX.Element {
  const router = useRouter();

  const [msg, setMsg] = useState<Msg>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // vamos guardar o timeout pra limpar no unmount
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // mesmo padrão regex que o backend aplica (@Email + domínio válido)
  const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

  const validationSchema = useMemo(
    () =>
      Yup.object({
        newEmail: Yup.string()
          .required("New e-mail is required")
          .matches(EMAIL_REGEX, "E-mail must contain a valid domain"),
      }),
    []
  );

  const onSubmit = async (values: { newEmail: string }) => {
    setMsg(null);

    try {
      // Esse endpoint é autenticado:
      // - Authorization: Bearer <access> vem do interceptor do `api`
      // - CSRF também é injetado pelo interceptor se precisar.
      const res = await api.post(
        "/api/v1/auth/email/change-request",
        { newEmail: values.newEmail.trim().toLowerCase() },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          withCredentials: true,
        }
      );

      // sucesso 2xx
      if (res.status >= 200 && res.status < 300) {
        setIsSuccess(true);
        setMsg({
          type: "ok",
          text:
            "We've sent a confirmation link to your new e-mail. " +
            "Please check your inbox and confirm the change. " +
            "You'll be redirected to the Dashboard shortly…",
        });

        // redirect após ~3s pro dashboard
        redirectTimerRef.current = setTimeout(() => {
          router.push("/protected/dashboard");
        }, 3000);
        return;
      }

      // fallback inesperado (mas ainda dentro do bloco try)
      setMsg({
        type: "err",
        text: `Unexpected status ${res.status}`,
      });
    } catch (err: any) {
      // erro vindo do backend com payload JSON
      const text =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        err?.message ||
        "Could not request e-mail change.";
      setMsg({ type: "err", text });
    }
  };

  // limpa timeout se o usuário sair antes do redirect
  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, []);

  return (
    <PasswordRequiredGate>
      <main className="relative min-h-screen bg-gray-100 px-4 pt-32 pb-8 dark:bg-black">
        {/* botão de voltar fixo no topo-esquerdo */}
        <BackButton to="/protected/dashboard" fixed position="above-box" />

        <div className="mx-auto w-full max-w-md rounded-lg border border-zinc-300 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <h1 className="mb-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          Change E-mail
        </h1>

        <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-300">
          Enter the new e-mail address you want to use for your account.
        </p>

        <Formik
          initialValues={{ newEmail: "" }}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {({ isSubmitting, isValid, touched }) => (
            <Form className="space-y-4">
              <div className="space-y-1">
                <label className="mb-1 block text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  New e-mail
                </label>

                <Field
                  name="newEmail"
                  type="email"
                  placeholder="you@new-domain.com"
                  className="h-11 w-full rounded border border-gray-300 px-3 text-black"
                  autoComplete="email"
                />

                <ErrorMessage
                  name="newEmail"
                  component="div"
                  className="text-sm text-red-500"
                />

                <p className="text-xs text-gray-600 dark:text-gray-400">
                  We'll send a confirmation link to this address. The change
                  only completes after you click that link.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !isValid || isSuccess || !touched.newEmail}
                className={`w-full rounded px-4 py-2 text-white transition ${
                  isSuccess
                    ? "bg-green-500 cursor-not-allowed"
                    : isSubmitting || !isValid || !touched.newEmail
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {isSuccess ? (
                  <span className="flex items-center justify-center gap-2">
                    <span>✓</span>
                    Email Change Requested
                  </span>
                ) : isSubmitting ? (
                  "Saving…"
                ) : (
                  "Save new email"
                )}
              </button>

              {msg && (
                <p
                  className={`text-center text-sm ${
                    msg.type === "ok" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {msg.text}
                </p>
              )}
            </Form>
          )}
        </Formik>
        </div>
      </main>
    </PasswordRequiredGate>
  );
}
