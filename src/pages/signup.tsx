// src/pages/signup.tsx
"use client";

import React, { useState } from "react";
import { Formik, Field, Form, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/router";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { setCookie } from "@/utils/cookies";

interface SignUpValues {
  name: string;
  email: string;
  password: string;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://dianagloballoginregister-52599bd07634.herokuapp.com";

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;
const PASSWORD_RULE_TEXT =
  "Password must be at least 8 characters and include 1 uppercase letter, 1 lowercase letter, and at least 1 digit.";

export default function SignUpPage(): JSX.Element {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [needsGoogle, setNeedsGoogle] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    email: Yup.string()
      .email("Invalid email")
      .matches(EMAIL_REGEX, "Email must contain a valid domain")
      .required("Email is required"),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters long")
      .matches(PASSWORD_REGEX, PASSWORD_RULE_TEXT)
      .required("Password is required"),
  });

  const handleSubmit = async (
    values: SignUpValues,
    { setSubmitting: setSubmittingFormik, setErrors }: FormikHelpers<SignUpValues>
  ) => {
    setFormError(null);
    setNeedsGoogle(false);
    setSubmitting(true);
    setSubmittingFormik(true);

    try {
      const url = `${API_BASE}/api/auth/register`;
      const res = await axios.post(url, values, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        // permite tratar respostas não-2xx aqui
        validateStatus: () => true,
      });

      // Backend retornou erro
      if (res.status >= 400) {
        const data = res.data;
        const msg = data?.message || data?.detail || `Error ${res.status}`;

        // caso específico: backend sugere login via Google
        if (/google/i.test(msg) && /password/i.test(msg)) {
          setNeedsGoogle(true);
          setFormError(msg);
          return;
        }

        // erros de validação (400)
        if (res.status === 400 && data) {
          const fieldErrors = data?.errors;
          if (fieldErrors && typeof fieldErrors === "object") {
            const mapped: Partial<Record<keyof SignUpValues, string>> = {};
            if (fieldErrors.name) mapped.name = String(fieldErrors.name);
            if (fieldErrors.email) mapped.email = String(fieldErrors.email);
            if (fieldErrors.password) mapped.password = String(fieldErrors.password);
            setErrors(mapped);
          }
        }

        if (res.status === 409) {
          setFormError("This e-mail is already registered.");
        } else {
          setFormError(msg);
        }
        return;
      }

      // sucesso: guardar e-mail pendente em COOKIE (não mais localStorage)
      try {
        setCookie("dg.pendingEmail", values.email, 1, {
          sameSite: "Lax",
          secure: typeof location !== "undefined" && location.protocol === "https:",
        });
      } catch {}

      // redireciona para check-email (modo confirm)
      router.push({
        pathname: "/check-email",
        query: { mode: "confirm", email: values.email },
      });
    } catch (err: any) {
      setFormError(err?.message || "Network error.");
    } finally {
      setSubmitting(false);
      setSubmittingFormik(false);
    }
  };

  const onGoogle = () => {
    // inicia OAuth (next-auth provider)
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async () => {
      const { signIn } = await import("next-auth/react");
      signIn("google", { callbackUrl: "/protected/dashboard" });
    })();
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-black px-4">
      <div className="bg-white dark:bg-gray-900 p-8 rounded shadow max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center text-black dark:text-white">
          Create your account
        </h1>

        {formError && <p className="text-center text-red-600 text-sm mb-4">{formError}</p>}

        {needsGoogle ? (
          <div className="text-center mb-4">
            <button
              onClick={onGoogle}
              className="w-full py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              Continue with Google
            </button>
            <p className="text-xs text-gray-600 mt-2 dark:text-gray-300">
              Then you can set a password inside your account if you want.
            </p>
          </div>
        ) : (
          <Formik
            initialValues={{ name: "", email: "", password: "" }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {() => (
              <Form className="space-y-4">
                <div>
                  <Field
                    type="text"
                    name="name"
                    placeholder="Your name"
                    className="w-full p-2 border border-gray-300 rounded text-black"
                    autoComplete="name"
                  />
                  <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div>
                  <Field
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    className="w-full p-2 border border-gray-300 rounded text-black"
                    autoComplete="email"
                  />
                  <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div className="relative">
                  <Field
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    className="w-full p-2 border border-gray-300 rounded text-black pr-12"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5
                               bg-transparent
                               text-slate-600 hover:text-blue-600
                               dark:text-gray-300 dark:hover:text-blue-400"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                  <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <p className="text-xs text-gray-600 mb-0 dark:text-gray-300">
                  Password requirements: at least <strong>8 characters</strong>, including{" "}
                  <strong>1 uppercase</strong>, <strong>1 lowercase</strong>, and <strong>at least 1 digit</strong>.
                </p>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:opacity-60"
                >
                  {submitting ? "Creating account…" : "Sign Up"}
                </button>
              </Form>
            )}
          </Formik>
        )}

        <div className="text-center mt-4">
          <Link href="/forgot-password" className="text-blue-500 hover:underline">
            Forgot your password?
          </Link>
        </div>

        <p className="text-center text-sm mt-4 text-black dark:text-white">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>

        {!needsGoogle && (
          <div className="max-w-sm mx-auto p-4">
            <GoogleSignInButton callbackUrl="/protected/dashboard" />
          </div>
        )}
      </div>
    </main>
  );
}
