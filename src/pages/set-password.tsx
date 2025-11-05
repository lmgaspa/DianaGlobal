// src/pages/set-password.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { Formik, Field, Form, ErrorMessage, FormikValues } from "formik";
import * as Yup from "yup";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  injectCsrfIntoFetchInit,
  captureCsrfFromFetchResponse,
} from "@/lib/security/csrf";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://dianagloballoginregister-52599bd07634.herokuapp.com";

const PASSWORD_RULE = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;

type Msg = { type: "ok" | "err"; text: string } | null;

// pequena helper pra ler cookie simples tipo "dg.pendingEmail"
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie.split(";");
  for (const raw of cookies) {
    const [k, ...rest] = raw.trim().split("=");
    if (k === name) {
      return decodeURIComponent(rest.join("="));
    }
  }
  return null;
}

// apaga cookie definindo expiração passada
function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax${
    typeof location !== "undefined" && location.protocol === "https:" ? ";Secure" : ""
  }`;
}

const SetPasswordPage: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // vamos capturar o e-mail detectável uma vez e guardar em estado
  const [detectedEmail, setDetectedEmail] = useState<string | null>(null);
  const [checkedEmail, setCheckedEmail] = useState(false); // pra saber quando já tentamos detectar

  // tenta achar o e-mail do usuário por várias fontes:
  // 1. sessão NextAuth
  // 2. cookie dg.pendingEmail (definido no fluxo de login/confirm)
  // 3. localStorage fallback antigo
  // 4. query string ?email=
  useEffect(() => {
    const tryDetect = () => {
      // 1. NextAuth session
      if (session?.user?.email) {
        return session.user.email;
      }

      // 2. cookie
      const fromCookie = getCookie("dg.pendingEmail");
      if (fromCookie) {
        return fromCookie;
      }

      // 3. localStorage (legado)
      try {
        const lsEmail =
          localStorage.getItem("dg.userEmail") ||
          localStorage.getItem("dg.email") ||
          localStorage.getItem("email");
        if (lsEmail) {
          return lsEmail;
        }
      } catch {
        /* ignore localStorage errors */
      }

      // 4. URL (?email=)
      try {
        if (typeof window !== "undefined") {
          const urlParams = new URLSearchParams(window.location.search);
          const eParam = urlParams.get("email");
          if (eParam) {
            return eParam;
          }
        }
      } catch {
        /* ignore URL parse errors */
      }

      return null;
    };

    const found = tryDetect();
    setDetectedEmail(found);
    setCheckedEmail(true);
  }, [session?.user?.email]);

  // se o usuário NÃO está autenticado via NextAuth + NÃO temos e-mail detectado,
  // mandamos ele pro /login (mas só depois que tentamos detectar)
  // EXCEÇÃO: Se há email na URL query, não redirecionar (pode ser Google user sem senha vindo do bloqueio)
  useEffect(() => {
    if (!checkedEmail) return; // ainda não terminamos a detecção
    
    // Verificar se há email na URL query (pode ter sido passado pelo PasswordRequiredGate)
    const hasEmailInUrl = typeof window !== "undefined" && 
      new URLSearchParams(window.location.search).get("email") !== null;
    
    // Só redirecionar se não está autenticado, não tem email detectado E não tem email na URL
    if (status === "unauthenticated" && !detectedEmail && !hasEmailInUrl) {
      router.push("/login");
    }
  }, [checkedEmail, status, detectedEmail, router]);

  const validationSchema = useMemo(
    () =>
      Yup.object({
        password: Yup.string()
          .matches(
            PASSWORD_RULE,
            "Password must be at least 8 characters and include 1 uppercase letter, 1 lowercase letter, and 1 digit."
          )
          .required("Please enter a new password"),
      }),
    []
  );

  // chamada de criação de senha
  // endpoint backend: POST /api/v1/auth/password/set-unauthenticated
  // body: { email, newPassword }
  // regras no backend:
  //   - só permite se o user for GOOGLE e ainda não tiver senha
  //   - se já tiver senha => 403
  const handleSetPassword = async (values: FormikValues) => {
    setMsg(null);
    setIsProcessing(true);

    const emailToUse = detectedEmail?.trim().toLowerCase() || "";

    if (!emailToUse) {
      setMsg({
        type: "err",
        text: "Could not detect your email. Please sign in again.",
      });
      setIsProcessing(false);
      return;
    }

    try {
      // Injetar CSRF token no request (necessário para mutações)
      const requestInit = injectCsrfIntoFetchInit({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: emailToUse,
          newPassword: values.password,
        }),
      });

      const response = await fetch(
        `${API_BASE}/api/v1/auth/password/set-unauthenticated`,
        requestInit
      );

      // Capturar CSRF token da resposta (se houver)
      captureCsrfFromFetchResponse(response);

      if (response.ok) {
        setIsSuccess(true);
        setMsg({
          type: "ok",
          text: "Password created successfully! You can now sign in using email and password as well.",
        });

        // já que agora o usuário tem senha, podemos limpar esse cookie temporário
        deleteCookie("dg.pendingEmail");

        // depois de alguns segundos, manda pro dashboard com flag para forçar recarregamento do perfil
        setTimeout(() => {
          // Redirecionar para dashboard com flag que indica que senha foi setada
          // O dashboard vai recarregar o perfil automaticamente
          router.push("/protected/dashboard?passwordSet=true");
        }, 3000);
      } else {
        // tentar extrair erro legível
        let errText = "Failed to set password. Please try again.";
        try {
          const ct = response.headers.get("content-type") || "";
          if (ct.includes("application/json")) {
            const json = await response.json();
            errText =
              json?.message ||
              json?.detail ||
              json?.error ||
              errText;
          } else {
            const raw = await response.text();
            if (raw) errText = raw;
          }
        } catch {
          /* ignore parse error */
        }

        setMsg({ type: "err", text: errText });
      }
    } catch (error: any) {
      setMsg({
        type: "err",
        text: error?.message || "Network error. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // se ainda estou detectando email (checkedEmail === false), segura o render
  if (!checkedEmail) {
    return (
      <div className="flex items-center justify-center min-h-screen h-screen text-black bg-gray-100 dark:bg-black pb-12">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md dark:bg-gray-900 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // se já detectamos, mas não temos e-mail e já redirecionamos no useEffect,
  // mostra um fallback leve (piscada de segurança)
  if (!detectedEmail) {
    return (
      <div className="flex items-center justify-center min-h-screen h-screen text-black bg-gray-100 dark:bg-black pb-12">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md dark:bg-gray-900 text-center">
          <p className="text-red-500 text-sm">
            Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen h-screen text-black bg-gray-100 dark:bg-black pb-12">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md dark:bg-gray-900">
        <h1 className="text-2xl font-bold mb-6 text-center text-black dark:text-white">
          Set your password
        </h1>

        <p className="text-sm text-center mb-6 text-gray-600 dark:text-gray-300">
          Your account was created using Google. Your email is already verified ✅,
          but you haven't set a password yet. You can create one now to also sign in
          using email and password.
        </p>

        {msg && (
          <p
            className={`text-sm text-center mb-4 ${
              msg.type === "ok" ? "text-green-500" : "text-red-500"
            }`}
          >
            {msg.text}
          </p>
        )}

        <Formik
          initialValues={{ password: "" }}
          validationSchema={validationSchema}
          onSubmit={handleSetPassword}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form>
              <div className="mb-4">
                <div className="relative">
                  <Field
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="New password (min 8, 1 uppercase, 1 lowercase, 1 digit)"
                    className={`w-full p-2 pr-12 border ${
                      errors.password && touched.password
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded text-black`}
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center text-slate-600 dark:text-gray-300"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />

                <p className="text-xs text-gray-600 mt-1">
                  Requirements: at least <strong>8 characters</strong>, including{" "}
                  <strong>1 uppercase</strong>, <strong>1 lowercase</strong>, and{" "}
                  <strong>1 digit</strong>.
                </p>

                <p className="text-[11px] text-gray-500 mt-2 break-all">
                  Using email: <strong>{detectedEmail}</strong>
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isProcessing || isSuccess}
                className={`w-full py-2 px-4 rounded transition ${
                  isSuccess
                    ? "bg-green-500 text-white cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-60"
                }`}
              >
                {isSuccess ? (
                  <span className="flex items-center justify-center gap-2">
                    <span>✓</span>
                    Password Set Successfully
                  </span>
                ) : isSubmitting || isProcessing ? (
                  "Setting password..."
                ) : (
                  "Set password"
                )}
              </button>

              <p className="text-center text-sm mt-4 text-black dark:text-white">
                Already have a password?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="text-blue-500 hover:underline ml-1"
                >
                  Sign in
                </button>
              </p>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default SetPasswordPage;
