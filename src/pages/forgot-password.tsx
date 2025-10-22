// src/pages/forgot-password.tsx
"use client";

import React, { useState } from "react";
import { Formik, Field, Form, ErrorMessage, FormikValues } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import { useRouter } from "next/router";
import { setCookie } from "@/utils/cookies";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://dianagloballoginregister-52599bd07634.herokuapp.com";

const ForgotPassword: React.FC = () => {
  const router = useRouter();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email address").required("Email is required"),
  });

  const handleForgotPassword = async (values: FormikValues) => {
    setMessage(null);
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email: values.email }),
      });

      if (!res.ok) {
        // tenta ler uma mensagem útil se a API retornar texto/json
        try {
          const ct = res.headers.get("content-type") || "";
          if (ct.includes("application/json")) {
            const j = await res.json();
            throw new Error(j?.message || j?.detail || "Failed to send reset link.");
          } else {
            const t = await res.text();
            throw new Error(t || "Failed to send reset link.");
          }
        } catch (e: any) {
          throw new Error(e?.message || "Failed to send reset link.");
        }
      }

      // guarda e-mail pendente em COOKIE (não mais localStorage)
      setCookie("dg.pendingResetEmail", String(values.email), 1, {
        sameSite: "Lax",
        secure: typeof location !== "undefined" && location.protocol === "https:",
      });

      // redireciona para a tela de check-email (mantém query para UX)
      router.replace(`/check-email?mode=reset&email=${encodeURIComponent(String(values.email))}`);
    } catch (e: any) {
      setMessage({ type: "error", text: e?.message || "Something went wrong." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen h-screen text-black bg-gray-100 dark:bg-black pb-12">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md dark:bg-gray-900">
        <h1 className="text-2xl font-bold mb-6 text-center text-black dark:text-white">
          Forgot your password?
        </h1>

        {message && (
          <p
            className={`text-sm text-center mb-4 ${
              message.type === "success" ? "text-green-500" : "text-red-500"
            }`}
          >
            {message.text}
          </p>
        )}

        <Formik initialValues={{ email: "" }} validationSchema={validationSchema} onSubmit={handleForgotPassword}>
          {({ errors, touched }) => (
            <Form>
              <div className="mb-4">
                <Field
                  type="email"
                  name="email"
                  placeholder="Email address"
                  className={`w-full p-2 border ${
                    errors.email && touched.email ? "border-red-500" : "border-gray-300"
                  } rounded text-black`}
                  autoComplete="email"
                />
                <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
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
                <Link href="/login" className="text-blue-500 hover:underline ml-1">
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
