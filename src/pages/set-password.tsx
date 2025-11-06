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
  getCsrfToken,
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
      // Se temos sessão NextAuth válida, pode ser que o backend precise do access token
      // Mesmo sendo "unauthenticated", o backend pode verificar se o usuário é Google sem senha
      const sessionAccessToken = (session as any)?.accessToken as string | undefined;
      
      // Preparar headers
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      
      // Se temos access token da sessão, adicionar Authorization header
      // Isso pode ser necessário para o backend validar que é um Google user sem senha
      if (sessionAccessToken) {
        headers["Authorization"] = `Bearer ${sessionAccessToken}`;
      }

      // Injetar CSRF token no request (se existir)
      // Se não existir, o backend deve gerar um novo token na primeira requisição POST
      // e retornar no cookie Set-Cookie, que será capturado automaticamente
      const requestInit = injectCsrfIntoFetchInit({
        method: "POST",
        headers,
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
      // O backend pode gerar um novo token CSRF na primeira requisição POST
      captureCsrfFromFetchResponse(response);

      // Se receber 403, pode ser CSRF inválido - tentar obter novo token e retry
      if (response.status === 403) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData?.message || "";
        
        if (errorMessage.includes("CSRF") || errorMessage.includes("csrf")) {
          // Tentar obter novo CSRF token fazendo uma requisição GET em endpoint público
          // O backend deve gerar CSRF token na primeira requisição e retornar no cookie
          try {
            // Tentar fazer uma requisição GET em um endpoint que não requer autenticação
            // Se não houver endpoint público disponível, tentar fazer POST novamente
            // (o backend deve gerar token na primeira requisição POST)
            const csrfFetch = await fetch(`${API_BASE}/api/v1/auth/register`, {
              method: "GET",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
            }).catch(() => null);
            
            if (csrfFetch) {
              captureCsrfFromFetchResponse(csrfFetch);
            }
            
            // Tentar novamente o POST com novo token CSRF
            const retryRequestInit = injectCsrfIntoFetchInit({
              method: "POST",
              headers,
              credentials: "include",
              body: JSON.stringify({
                email: emailToUse,
                newPassword: values.password,
              }),
            });
            
            const retryResponse = await fetch(
              `${API_BASE}/api/v1/auth/password/set-unauthenticated`,
              retryRequestInit
            );
            captureCsrfFromFetchResponse(retryResponse);
            
            if (retryResponse.ok) {
              // Sucesso no retry
              setIsSuccess(true);
              setMsg({
                type: "ok",
                text: "Password created successfully! Signing you in...",
              });
              deleteCookie("dg.pendingEmail");

              // Auto-login após criar senha
              const { signIn } = await import("next-auth/react");
              const signInResult = await signIn("credentials", {
                redirect: false,
                email: emailToUse,
                password: values.password,
              });

              if (signInResult?.error) {
                setMsg({
                  type: "err",
                  text: "Password created, but automatic sign-in failed. Please sign in manually.",
                });
                setTimeout(() => router.push("/login"), 3000);
                setIsProcessing(false);
                return;
              }

              // Fazer login manual para obter access token
              try {
                const { setAccessToken } = await import("@/lib/http");
                const loginResponse = await fetch(`${API_BASE}/api/v1/auth/login`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                  },
                  credentials: "include",
                  body: JSON.stringify({
                    email: emailToUse,
                    password: values.password,
                  }),
                });
                captureCsrfFromFetchResponse(loginResponse);
                if (loginResponse.ok) {
                  const loginData = await loginResponse.json();
                  const accessToken =
                    loginData?.accessToken || loginData?.token || loginData?.jwt || null;
                  if (accessToken) {
                    setAccessToken(accessToken);
                  }
                  await new Promise((resolve) => setTimeout(resolve, 500));
                  router.push("/protected/dashboard?passwordSet=true");
                } else {
                  setMsg({
                    type: "err",
                    text: "Password created, but automatic sign-in failed. Please sign in manually.",
                  });
                  setTimeout(() => router.push("/login"), 3000);
                }
              } catch (loginError) {
                setMsg({
                  type: "err",
                  text: "Password created, but automatic sign-in failed. Please sign in manually.",
                });
                setTimeout(() => router.push("/login"), 3000);
              }
              setIsProcessing(false);
              return;
            }
          } catch (retryError) {
            // Se retry falhar, continuar com tratamento de erro normal abaixo
          }
        }
      }

      if (response.ok) {
        setIsSuccess(true);
        setMsg({
          type: "ok",
          text: "Password created successfully! Signing you in...",
        });

        // já que agora o usuário tem senha, podemos limpar esse cookie temporário
        deleteCookie("dg.pendingEmail");

        // IMPORTANTE: Após setar senha, o backend pode invalidar os refresh tokens antigos
        // Precisamos fazer login novamente para obter novos tokens
        // Fazer login automático com email + senha recém-criada
        try {
          // Usar apenas o signIn do NextAuth para garantir que os tokens/cookies sejam gerenciados corretamente
          const { signIn } = await import("next-auth/react");
          const signInResult = await signIn("credentials", {
            redirect: false,
            email: emailToUse,
            password: values.password,
          });

          // signIn retorna undefined em caso de sucesso, ou um objeto com error em caso de falha
          if (signInResult?.error) {
            // Se login automático falhar, redirecionar para login manual
            setMsg({
              type: "ok",
              text: "Password created successfully! Please sign in with your new password.",
            });
            setTimeout(() => {
              router.push("/login");
            }, 2000);
          } else {
            // Login bem-sucedido - aguardar um pouco para garantir que a sessão está atualizada
            // O useBackendProfile vai sincronizar o token automaticamente via useEffect
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Redirecionar para dashboard após login bem-sucedido
            router.push("/protected/dashboard?passwordSet=true");
          }
        } catch (loginError) {
          // Se houver erro no login automático, redirecionar para login manual
          setMsg({
            type: "ok",
            text: "Password created successfully! Please sign in with your new password.",
          });
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        }
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
