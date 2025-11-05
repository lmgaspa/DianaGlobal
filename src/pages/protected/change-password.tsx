// src/pages/protected/change-password.tsx
"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { api } from "@/lib/api";
import BackButton from "@/components/common/BackButton";
import PasswordRequiredGate from "@/components/PasswordRequiredGate";

const PASSWORD_RULE = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;
const PASSWORD_RULE_TEXT =
  "Password must be at least 8 characters and include 1 uppercase letter, 1 lowercase letter, and 1 digit.";

type Msg = { type: "ok" | "err"; text: string } | null;

export default function ChangePasswordPage(): JSX.Element {
  const router = useRouter();

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [msg, setMsg] = useState<Msg>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // guardamos timeout pra limpar no unmount
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const validationSchema = useMemo(
    () =>
      Yup.object({
        currentPassword: Yup.string().required("Please enter your current password"),
        newPassword: Yup.string()
          .min(8, "Password must be at least 8 characters long")
          .matches(PASSWORD_RULE, PASSWORD_RULE_TEXT)
          .required("Please enter a new password"),
      }),
    []
  );

  const onSubmit = async (values: { currentPassword: string; newPassword: string }) => {
    setMsg(null);

    try {
      // endpoint protegido:
      // - Authorization: Bearer <access> vem do interceptor do `api`
      // - CSRF também é injetado no header se necessário
      const res = await api.post(
        "/api/v1/auth/password/change",
        values,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          withCredentials: true,
        }
      );

      if (res.status >= 200 && res.status < 300) {
        setIsSuccess(true);
        setMsg({
          type: "ok",
          text:
            "Your password has been updated. A confirmation e-mail is on the way. " +
            "You'll be redirected to the Dashboard shortly…",
        });

        // redirect suave pro dashboard depois de alguns segundos
        // Com flag para forçar recarregamento do perfil
        redirectTimerRef.current = setTimeout(() => {
          router.push("/protected/dashboard?passwordChanged=true");
        }, 3000);

        return;
      }

      // fallback inesperado mas não-explosivo
      setMsg({
        type: "err",
        text: `Unexpected status ${res.status}`,
      });
    } catch (err: any) {
      const text =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        err?.message ||
        "Could not change password.";
      setMsg({ type: "err", text });
    }
  };

  // limpar timeout se navegar antes do redirect
  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, []);

  return (
    <PasswordRequiredGate>
      <main className="relative min-h-screen bg-gray-100 px-4 pt-32 pb-8 dark:bg-black">
        {/* botão global de voltar no topo-esquerdo */}
        <BackButton to="/protected/dashboard" fixed position="above-box" />

        <div className="mx-auto w-full max-w-md rounded-lg border border-zinc-300 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <h1 className="mb-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          Change Password
        </h1>

        <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-300">
          Enter your current password and set a new one.
        </p>

        <Formik
          initialValues={{ currentPassword: "", newPassword: "" }}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {({ isSubmitting, isValid, touched }) => (
            <Form className="space-y-4">
              {/* Current password */}
              <div className="space-y-1">
                <label className="mb-1 block text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  Current password
                </label>

                <div className="relative">
                  <Field
                    name="currentPassword"
                    type={showCurrent ? "text" : "password"}
                    placeholder="Your current password"
                    className="h-11 w-full rounded border border-gray-300 px-3 pr-12 text-black"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent((v) => !v)}
                    className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center
                               bg-transparent text-slate-600 hover:text-blue-600
                               dark:text-gray-300 dark:hover:text-blue-400"
                    aria-label={showCurrent ? "Hide password" : "Show password"}
                    title={showCurrent ? "Hide password" : "Show password"}
                  >
                    <span className="text-xl leading-none">
                      {showCurrent ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </button>
                </div>

                <ErrorMessage
                  name="currentPassword"
                  component="div"
                  className="text-sm text-red-500"
                />
              </div>

              {/* New password */}
              <div className="space-y-1">
                <label className="mb-1 block text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  New password
                </label>

                <div className="relative">
                  <Field
                    name="newPassword"
                    type={showNew ? "text" : "password"}
                    placeholder="New password (min 8, 1 uppercase, 1 lowercase, 1 digit)"
                    className="h-11 w-full rounded border border-gray-300 px-3 pr-12 text-black"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((v) => !v)}
                    className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center
                               bg-transparent text-slate-600 hover:text-blue-600
                               dark:text-gray-300 dark:hover:text-blue-400"
                    aria-label={showNew ? "Hide password" : "Show password"}
                    title={showNew ? "Hide password" : "Show password"}
                  >
                    <span className="text-xl leading-none">
                      {showNew ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </button>
                </div>

                <ErrorMessage
                  name="newPassword"
                  component="div"
                  className="text-sm text-red-500"
                />

                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Requirements: at least <strong>8 characters</strong>, including{" "}
                  <strong>1 uppercase</strong>, <strong>1 lowercase</strong>, and{" "}
                  <strong>1 digit</strong>.
                </p>
              </div>

              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  !isValid ||
                  isSuccess ||
                  !touched.currentPassword ||
                  !touched.newPassword
                }
                className={`w-full rounded px-4 py-2 text-white transition ${
                  isSuccess
                    ? "bg-green-500 cursor-not-allowed"
                    : isSubmitting ||
                      !isValid ||
                      !touched.currentPassword ||
                      !touched.newPassword
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {isSuccess ? (
                  <span className="flex items-center justify-center gap-2">
                    <span>✓</span>
                    Password Updated Successfully
                  </span>
                ) : isSubmitting ? (
                  "Saving…"
                ) : (
                  "Save new password"
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
