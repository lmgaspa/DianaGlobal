// src/pages/protected/change-email.tsx
"use client";

import React, { useMemo, useRef, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import BackButton from "@/components/common/BackButton";
import { api } from "@/lib/api";

type Msg = { type: "ok" | "err"; text: string } | null;

export default function ChangeEmailPage(): JSX.Element {
  const router = useRouter();
  const [msg, setMsg] = useState<Msg>(null);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const validationSchema = useMemo(
    () =>
      Yup.object({
        newEmail: Yup.string()
          .email("Please enter a valid e-mail address")
          .required("New e-mail is required"),
      }),
    []
  );

  const onSubmit = async (values: { newEmail: string }) => {
    setMsg(null);
    try {
      // Protected endpoint; Authorization: Bearer <access> vai pelo axios interceptor
      const res = await api.post(
        "/api/auth/email/change-request",
        { newEmail: values.newEmail.trim().toLowerCase() },
        { headers: { "Content-Type": "application/json", Accept: "application/json" }, withCredentials: true }
      );

      if (res.status >= 200 && res.status < 300) {
        setMsg({
          type: "ok",
          text:
            "We’ve sent a confirmation link to your new e-mail. " +
            "Please check your inbox to finish the change. You’ll be redirected to the Dashboard shortly…",
        });
        redirectTimerRef.current = setTimeout(() => {
          router.push("/protected/dashboard");
        }, 3000);
      } else {
        setMsg({ type: "err", text: `Unexpected status ${res.status}` });
      }
    } catch (err: any) {
      const text =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        err?.message ||
        "Could not request e-mail change.";
      setMsg({ type: "err", text });
    }
  };

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, []);

  return (
    <main className="relative min-h-screen bg-gray-100 px-4 py-8 dark:bg-black">
      {/* Global, reusable back button (top-left fixed) */}
      <BackButton to="/protected/dashboard" text="Back" fixed />

      <div className="mx-auto w-full max-w-md rounded-lg border border-zinc-300 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <h1 className="mb-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Change E-mail</h1>
        <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-300">
          Enter the new e-mail address you want to use for your account.
        </p>

        <Formik initialValues={{ newEmail: "" }} validationSchema={validationSchema} onSubmit={onSubmit}>
          {({ isSubmitting, isValid }) => (
            <Form className="space-y-4">
              <div className="space-y-1">
                <label className="mb-1 block text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  New e-mail
                </label>
                <Field
                  name="newEmail"
                  type="email"
                  placeholder="you@new-domain.com"
                  className="h-11 w-full rounded border border-gray-300 px-3 text-black"
                  autoComplete="email"
                />
                <ErrorMessage name="newEmail" component="div" className="text-sm text-red-500" />
                <p className="text-xs text-gray-600">
                  You’ll receive a confirmation link. The change only completes after you confirm it.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !isValid}
                className={`w-full rounded px-4 py-2 text-white transition ${
                  isSubmitting || !isValid ? "cursor-not-allowed bg-blue-300" : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                Save new e-mail
              </button>

              {msg && (
                <p className={`text-center text-sm ${msg.type === "ok" ? "text-green-600" : "text-red-600"}`}>
                  {msg.text}
                </p>
              )}
            </Form>
          )}
        </Formik>
      </div>
    </main>
  );
}
