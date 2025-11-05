// src/pages/forgot-password.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Formik, Field, Form, ErrorMessage, FormikValues } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { setCookie } from "@/utils/cookies";
import { useBackendProfile } from "@/hooks/useBackendProfile";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://dianagloballoginregister-52599bd07634.herokuapp.com";

const ForgotPassword: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { profile } = useBackendProfile();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Verificar se usuário Google sem senha está tentando usar forgot password
  useEffect(() => {
    if (status === "authenticated" && profile) {
      const isGoogle = (profile.authProvider ?? "").toUpperCase() === "GOOGLE";
      const hasPassword = Boolean(profile.passwordSet);
      
      if (isGoogle && !hasPassword) {
        setMessage({
          type: "error",
          text: "You haven't set a password yet. Please use 'Set Password' to create your first password.",
        });
        // Redirecionar após 3 segundos
        setTimeout(() => {
          router.push("/set-password");
        }, 3000);
      }
    }
  }, [status, profile, router]);

  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email address").required("Email is required"),
  });

  const handleForgotPassword = async (values: FormikValues) => {
    setMessage(null);
    setSubmitting(true);

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

      if (!res.ok) {
        // tentar extrair feedback útil
        try {
          const ct = res.headers.get("content-type") || "";
          if (ct.includes("application/json")) {
            const j = await res.json();
            throw new Error(
              j?.message ||
                j?.detail ||
                `Failed to send reset link (status ${res.status}).`
            );
          } else {
            const t = await res.text();
            throw new Error(
              t || `Failed to send reset link (status ${res.status}).`
            );
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
