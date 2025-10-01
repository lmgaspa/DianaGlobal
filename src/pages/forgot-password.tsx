// src/pages/forgot-password.tsx
"use client";
import React, { useState } from "react";
import { Formik, Field, Form, ErrorMessage, FormikValues } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import { useRouter } from "next/router";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://dianagloballoginregister-52599bd07634.herokuapp.com";

const ForgotPassword: React.FC = () => {
  const router = useRouter();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid e-mail address").required("E-mail is required"),
  });

  const handleForgotPassword = async (values: FormikValues) => {
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email }),
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || "Failed to send reset link.");
      }

      try { localStorage.setItem("dg.pendingResetEmail", values.email); } catch {}
      router.replace(`/check-email?mode=reset&email=${encodeURIComponent(values.email)}`);
    } catch (e: any) {
      setMessage({ type: "error", text: e?.message || "Something went wrong." });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen h-screen text-black bg-gray-100 dark:bg-black pb-12">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md dark:bg-gray-900">
        <h1 className="text-2xl font-bold mb-6 text-center text-black dark:text-white">
          Forgot your password?
        </h1>

        {message && (
          <p className={`text-sm text-center mb-4 ${message.type === "success" ? "text-green-500" : "text-red-500"}`}>
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
                  placeholder="E-mail address"
                  className={`w-full p-2 border ${errors.email && touched.email ? "border-red-500" : "border-gray-300"} rounded`}
                  autoComplete="email"
                />
                <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              <button type="submit" className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
                Send reset link
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
