// src/pages/forgot-password.tsx
"use client";

import React, { useState } from "react";
import { Formik, Field, Form, ErrorMessage, FormikValues } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import { setCookie } from "@/utils/cookies";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://dianagloballoginregister-52599bd07634.herokuapp.com";

const ForgotPassword: React.FC = () => {
  const router = useRouter();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showGoogleBlock, setShowGoogleBlock] = useState(false);

  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email address").required("Email is required"),
  });

  const handleForgotPassword = async (values: FormikValues) => {
    setMessage(null);
    setSubmitting(true);
    setShowGoogleBlock(false);

    try {
      /**
       * Backend PasswordResetController.forgot-password:
       *   @PostMapping("/forgot-password")
       *   - espera { email }
       *   - responde 204 No Content sempre (não vaza se o email existe ou não)
       *
       * Depois dessa chamada, a UX manda o usuário pra check-email.
       */
      const res = await fetch(`${API_BASE}/api/v1/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email: values.email }),
        credentials: "include",
      });

      // Inspirado na lógica do login.tsx:
      // Se o backend retornar 403, verificar se a mensagem indica Google user sem senha
      if (res.status === 403) {
        let msg = "Unable to send reset link.";
        try {
          const ct = res.headers.get("content-type") || "";
          if (ct.includes("application/json")) {
            const data = await res.json();
            msg = data?.message || data?.detail || msg;
          } else {
            const t = await res.text();
            msg = t || msg;
          }
        } catch {
          /* ignore parse fail */
        }

        // Se o backend falou "use google ou defina senha primeiro" (mesma lógica do login)
        if (/google/i.test(msg) && /password/i.test(msg)) {
          setShowGoogleBlock(true);
          // Não redireciona automaticamente - usuário clica no botão quando quiser
          setSubmitting(false);
          return;
        }

        // Outros erros 403 (ex: email não confirmado)
        setMessage({
          type: "error",
          text: msg,
        });
        setSubmitting(false);
        return;
      }

      // Verificar outros erros
      if (!res.ok) {
        // tentar extrair feedback útil
        try {
          const ct = res.headers.get("content-type") || "";
          if (ct.includes("application/json")) {
            const j = await res.json();
            const errorMsg = j?.message || j?.detail || "";
            throw new Error(errorMsg || `Failed to send reset link (status ${res.status}).`);
          } else {
            const t = await res.text();
            throw new Error(t || `Failed to send reset link (status ${res.status}).`);
          }
        } catch (e: any) {
          throw new Error(e?.message || "Failed to send reset link.");
        }
      }

      // sucesso (204 normalmente). Guardar o e-mail em cookie curto:
      setCookie("dg.pendingResetEmail", String(values.email), 1, {
        sameSite: "Lax",
        secure:
          typeof location !== "undefined" &&
          location.protocol === "https:",
      });

      // redirecionar pra tela que manda o usuário olhar o inbox
      router.replace(
        `/check-email?mode=reset&email=${encodeURIComponent(
          String(values.email)
        )}`
      );
    } catch (e: any) {
      setMessage({
        type: "error",
        text: e?.message || "Something went wrong.",
      });
    } finally {
        setSubmitting(false);
    }
  };

  // Função para continuar com Google (mesma lógica do login)
  const onGoogle = () => {
    (async () => {
      await signIn("google", { callbackUrl: "/protected/dashboard" });
    })();
  };

  // Se mostrar bloqueio para Google user, usar o mesmo estilo do login
  if (showGoogleBlock) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-black px-4">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md w-full max-w-md">
          <div className="bg-red-50 border border-red-300 text-red-800 rounded-lg p-5 mb-4 text-center shadow-sm">
            <h3 className="font-semibold text-lg mb-2">⚠️ Set your password to unlock all features</h3>
            <p className="text-sm mb-3">
              Your account was created using Google OAuth2. Your email is already verified ✅,
              but you haven't set a password yet.
            </p>
            <div className="bg-red-100 border border-red-200 rounded p-3 mb-4 text-left">
              <p className="text-sm font-semibold mb-2">🚫 Suspended functions:</p>
              <ul className="text-xs space-y-1 list-disc list-inside">
                <li>Deposit</li>
                <li>Withdraw</li>
                <li>Buy with Money</li>
                <li>Swap</li>
              </ul>
              <p className="text-xs mt-2 text-red-700">
                These features will be available after you set a password.
              </p>
            </div>
            <button
              onClick={onGoogle}
              className="w-full py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 transition mb-3"
            >
              Continue with Google
            </button>
            <p className="text-xs text-gray-600 mt-2">
              After signing in with Google, you can set a password in your dashboard to unlock all features.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen h-screen text-black bg-gray-100 dark:bg-black pb-12">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md dark:bg-gray-900">
        <h1 className="text-2xl font-bold mb-6 text-center text-black dark:text-white">
          Forgot your password?
        </h1>

        {message && (
          <p
            className={`text-sm text-center mb-4 ${
              message.type === "success"
                ? "text-green-500"
                : "text-red-500"
            }`}
          >
            {message.text}
          </p>
        )}

        <Formik
          initialValues={{ email: "" }}
          validationSchema={validationSchema}
          onSubmit={handleForgotPassword}
        >
          {({ errors, touched }) => (
            <Form>
              <div className="mb-4">
                <Field
                  type="email"
                  name="email"
                  placeholder="Email address"
                  className={`w-full p-2 border ${
                    errors.email && touched.email
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded text-black`}
                  autoComplete="email"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:opacity-60"
              >
                {submitting ? "Sending..." : "Send reset link"}
              </button>

              <p className="text-center text-sm mt-4 text-black dark:text-white">
                Remembered your password?{" "}
                <Link
                  href="/login"
                  className="text-blue-500 hover:underline ml-1"
                >
                  Sign in
                </Link>
              </p>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default ForgotPassword;
