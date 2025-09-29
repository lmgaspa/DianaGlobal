"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const PASSWORD_RULE = /^(?=.*[A-Z])(?=.*[a-z])(?=(?:.*\d){6,}).{8,}$/;
const PASSWORD_RULE_TEXT =
  "Password must be at least 8 characters and include 1 uppercase letter, 1 lowercase letter, and 6 digits.";

type Msg = { type: "ok" | "err"; text: string } | null;

const ResetPassword: React.FC = () => {
  const router = useRouter();

  const [token, setToken] = useState("");
  const [routerReady, setRouterReady] = useState(false);

  // 1) Tenta via next/router quando estiver pronto
  useEffect(() => {
    if (!router.isReady) return;
    setRouterReady(true);
    const q = router.query?.token;
    if (typeof q === "string" && q) {
      setToken(q);
    }
  }, [router.isReady, router.query?.token]);

  // 2) Fallback: lê direto de window.location.search
  useEffect(() => {
    if (token) return; // já temos
    if (typeof window === "undefined") return;
    const t = new URLSearchParams(window.location.search).get("token") ?? "";
    if (t) setToken(t);
  }, [token]);

  const isTokenMode = !!token;

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);

  const validationSchema = useMemo(
    () =>
      Yup.object({
        password: Yup.string()
          .min(8, "Password must be at least 8 characters long")
          .matches(PASSWORD_RULE, PASSWORD_RULE_TEXT)
          .required("Please enter a new password"),
      }),
    []
  );

  const handleSubmit = async (values: { password: string }) => {
    setMsg(null);
    const res = await fetch(
      "https://dianagloballoginregister-52599bd07634.herokuapp.com/api/auth/reset-password",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: values.password }),
      }
    );
    if (res.ok) {
      setMsg({ type: "ok", text: "Password changed successfully. You can sign in now." });
      setTimeout(() => router.push("/login"), 1200);
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
      } catch {}
      setMsg({ type: "err", text });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-black">
      <div className="bg-white dark:bg-gray-900 p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-black dark:text-white">
          Set a new password
        </h1>

        {/* Mostra “missing token” só quando o router já ficou pronto e o fallback também já rodou */}
        {routerReady && !isTokenMode ? (
          <p className="text-red-600 text-center">
            Missing token. Please use the link from your e-mail.
          </p>
        ) : !isTokenMode ? (
          // Enquanto ainda tentando descobrir o token, mostra um “loading” leve
          <p className="text-center text-gray-500">Checking reset link…</p>
        ) : (
          <Formik initialValues={{ password: "" }} validationSchema={validationSchema} onSubmit={handleSubmit}>
            {({ isSubmitting, isValid, touched }) => (
              <Form className="space-y-4">
                <div className="relative">
                  <Field
                    name="password"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="New password (min 8, 1 uppercase, 1 lowercase, 6 digits)"
                    className="w-full p-2 border border-gray-300 rounded text-black pr-10"
                    autoComplete="new-password"
                  />
                  <span
                    className="absolute right-3 top-3 text-gray-600 cursor-pointer"
                    onClick={() => setShowNewPassword((v) => !v)}
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                    title={showNewPassword ? "Hide password" : "Show password"}
                  >
                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                  <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
                  <p className="text-xs text-gray-600 mt-1">
                    Requirements: at least <strong>8 characters</strong>, including{" "}
                    <strong>1 uppercase</strong>, <strong>1 lowercase</strong>, and <strong>6 digits</strong>.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !isValid || !touched.password}
                  className={`w-full py-2 px-4 rounded transition ${
                    isSubmitting || !isValid || !touched.password
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
}

export default ResetPassword;