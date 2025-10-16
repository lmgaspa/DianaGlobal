// src/pages/reset-password.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://dianagloballoginregister-52599bd07634.herokuapp.com";

const PASSWORD_RULE = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;
const PASSWORD_RULE_TEXT =
  "Password must be at least 8 characters and include 1 uppercase letter, 1 lowercase letter, and 1 digit.";

type Msg = { type: "ok" | "err"; text: string } | null;

const ResetPasswordPage: React.FC = () => {
  const router = useRouter();

  const [token, setToken] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);

  // lê token da query
  useEffect(() => {
    if (!router.isReady) return;
    const q = router.query?.token;
    if (typeof q === "string" && q) setToken(q);
  }, [router.isReady, router.query?.token]);

  // fallback: lê token da URL (SSR/rotas estáticas)
  useEffect(() => {
    if (token) return;
    if (typeof window === "undefined") return;
    const t = new URLSearchParams(window.location.search).get("token") ?? "";
    if (t) setToken(t);
  }, [token]);

  const validationSchema = useMemo(
    () =>
      Yup.object({
        password: Yup.string()
          .min(8, "Password must be at least 8 characters long and include uppercase, lowercase, and a digit")
          .matches(PASSWORD_RULE, PASSWORD_RULE_TEXT)
          .required("Please enter a new password"),
      }),
    []
  );

  const handleSubmit = async (values: { password: string }) => {
    setMsg(null);
    const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ token, newPassword: values.password }),
    });

    if (res.ok) {
      setMsg({ type: "ok", text: "Password changed successfully. You can sign in now." });
      // limpeza de legado (se existir)
      try {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      } catch { }
      setTimeout(() => router.push("/login"), 3000);
    } else {
      let text = "Invalid or expired link. Please request a new reset e-mail.";
      try {
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          const j = await res.json();
          text = j?.message || j?.detail || text;
        } else {
          text = (await res.text()) || text;
        }
      } catch { }
      setMsg({ type: "err", text });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-black">
      <div className="bg-white dark:bg-gray-900 p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-black dark:text-white">
          Set a new password
        </h1>

        {!token ? (
          <p className="text-red-600 text-center">
            Missing token. Please use the link from your e-mail.
          </p>
        ) : (
          <Formik initialValues={{ password: "" }} validationSchema={validationSchema} onSubmit={handleSubmit}>
            {({ isSubmitting, isValid, touched }) => (
              <Form className="space-y-4">
                <div className="space-y-1">
                  <div className="relative">
                    <Field
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="New password (min 8, 1 uppercase, 1 lowercase, 1 digit)"
                      className="w-full h-11 px-3 pr-12 border border-gray-300 rounded text-black"
                      autoComplete="new-password"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center
                 bg-transparent text-slate-600 hover:text-blue-600
                 dark:text-gray-300 dark:hover:text-blue-400"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      <span className="leading-none text-xl">
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </span>
                    </button>
                  </div>

                  <ErrorMessage name="password" component="div" className="text-red-500 text-sm" />

                  <p className="text-xs text-gray-600">
                    Requirements: at least <strong>8 characters</strong>, including{" "}
                    <strong>1 uppercase</strong>, <strong>1 lowercase</strong>, and <strong>1 digit</strong>.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !isValid || !touched.password || !token}
                  className={`w-full py-2 px-4 rounded transition ${isSubmitting || !isValid || !touched.password || !token
                      ? "bg-blue-300 cursor-not-allowed text-white"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                    }`}
                >
                  Save new password
                </button>

                {msg && (
                  <p className={`text-sm text-center ${msg.type === "ok" ? "text-green-600" : "text-red-600"}`}>
                    {msg.text}
                  </p>
                )}
              </Form>
            )}
          </Formik>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
