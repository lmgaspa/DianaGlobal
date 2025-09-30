// src/pages/login.tsx
"use client";

import React, { useState } from "react";
import { Formik, Field, Form, ErrorMessage, FormikValues } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import { useRouter } from "next/router";
import { signIn, getSession } from "next-auth/react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import GoogleSignInButton from "@/components/GoogleSignInButton";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://dianagloballoginregister-52599bd07634.herokuapp.com";

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
});

const Login: React.FC = () => {
  const router = useRouter();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (values: FormikValues) => {
    setLoginError(null);
    setSubmitting(true);

    const email = String(values.email ?? "")
      .trim()
      .toLowerCase();
    const password = String(values.password ?? "");

    try {
      // ---- Passo A: checar status real no backend
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (res.status === 401) {
        setLoginError("Email or password are incorrect.");
        return;
      }

      if (res.status === 403) {
        // tentar extrair mensagem opcional
        let msg = "Please confirm your e-mail to sign in.";
        try {
          const ct = res.headers.get("content-type") || "";
          if (ct.includes("application/json")) {
            const j = await res.json();
            msg = j?.message || j?.detail || msg;
          } else {
            msg = (await res.text()) || msg;
          }
        } catch {}
        setLoginError(msg);

        // manda para a tela de "check your e-mail" com máscara lá
        setTimeout(() => {
          router.push(`/check-email?email=${encodeURIComponent(email)}`);
        }, 900);
        return;
      }

      if (!res.ok) {
        // outros erros (500, etc.)
        let msg = `Unexpected error (${res.status}). Please try again.`;
        try {
          const ct = res.headers.get("content-type") || "";
          if (ct.includes("application/json")) {
            const j = await res.json();
            msg = j?.message || j?.detail || msg;
          } else {
            msg = (await res.text()) || msg;
          }
        } catch {}
        setLoginError(msg);
        return;
      }

      // ---- Passo B: criar sessão NextAuth (usa o provider credentials)
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        // Se algo falhar dentro do authorize do NextAuth, mostramos msg genérica
        setLoginError("Could not create session. Please try again.");
        return;
      }

      // Garante que a sessão foi criada e contém user.id (pela sua extensão)
      const session = await getSession();
      if (!session?.user || !("id" in session.user)) {
        setLoginError("Failed to retrieve user session.");
        return;
      }

      // vai para o dashboard protegido
      router.replace("/protected/dashboard");
    } catch (e: any) {
      setLoginError(e?.message || "Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen h-screen text-black bg-gray-100 dark:bg-black pb-12">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md dark:bg-gray-900">
        <h1 className="text-2xl font-bold mb-6 text-center text-black dark:text-white">
          Sign In
        </h1>

        {loginError && (
          <p className="text-red-500 text-sm text-center mb-4">{loginError}</p>
        )}

        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={validationSchema}
          onSubmit={handleLogin}
        >
          {({ errors, touched }) => (
            <Form>
              <div className="mb-4">
                <Field
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  className={`w-full p-2 border ${
                    errors.email && touched.email
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded`}
                  autoComplete="email"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div className="mb-4 relative">
                <Field
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  className={`w-full p-2 pr-10 border ${
                    errors.password && touched.password
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded`}
                  autoComplete="current-password"
                />
                <span
                  className="absolute right-3 top-3 text-gray-600 cursor-pointer"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:opacity-60"
              >
                {submitting ? "Signing in…" : "Continue"}
              </button>

              <p className="text-center text-sm mt-4 text-black dark:text-white">
                <Link
                  href="/forgot-password"
                  className="text-blue-500 hover:underline"
                >
                  Forgot Password?
                </Link>
              </p>

              <p className="text-center text-sm mt-4 text-black dark:text-white">
                Don&apos;t have an account?
                <Link
                  href="/signup"
                  className="text-blue-500 hover:underline ml-1"
                >
                  Register here
                </Link>
              </p>
              <div>
                <main className="max-w-sm mx-auto p-4">
                  <GoogleSignInButton callbackUrl="/protected/dashboard" />
                  {/* Personalize o texto/estilo se quiser */}
                  {/* <GoogleSignInButton label="Entrar com Google" className="mt-6" /> */}
                </main>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Login;
