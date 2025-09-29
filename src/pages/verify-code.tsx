"use client";

import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

const schema = Yup.object({
  email: Yup.string()
    .email("Invalid e-mail")
    .required("E-mail is required"),
  code: Yup.string()
    .matches(/^\d{6}$/, "Enter the 6-digit code")
    .required("Code is required"),
});

export default function VerifyCodePage() {
  const router = useRouter();
  const [serverMsg, setServerMsg] = useState<string | null>(null);
  const [serverErr, setServerErr] = useState<string | null>(null);

  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://dianagloballoginregister-52599bd07634.herokuapp.com";

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-black px-4">
      <div className="bg-white dark:bg-gray-900 p-8 rounded shadow max-w-md w-full">
        <h1 className="text-2xl font-semibold text-black dark:text-white mb-4 text-center">
          Verify code
        </h1>

        {serverMsg && <p className="text-green-600 text-center mb-4">{serverMsg}</p>}
        {serverErr && <p className="text-red-600 text-center mb-4">{serverErr}</p>}

        <Formik
          initialValues={{ email: "", code: "" }}
          validationSchema={schema}
          onSubmit={async (values, { setSubmitting }) => {
            setServerMsg(null);
            setServerErr(null);
            try {
              await axios.post(`${API_BASE}/api/auth/confirm-account/code`, values, {
                headers: { "Content-Type": "application/json" },
              });
              setServerMsg("Your e-mail was successfully confirmed. You can now log in.");
            } catch (err: any) {
              const status = err?.response?.status;
              setServerErr(
                status === 400 || status === 401
                  ? "Invalid or expired code."
                  : "We could not confirm your e-mail now. Please try again."
              );
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <div className="mb-4">
                <Field
                  type="email"
                  name="email"
                  placeholder="E-mail"
                  className="w-full p-2 border border-gray-300 rounded"
                  autoComplete="email"
                />
                <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              <div className="mb-4">
                <Field
                  type="text"
                  name="code"
                  placeholder="6-digit code"
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={6}
                  className="w-full p-2 border border-gray-300 rounded tracking-widest text-center"
                />
                <ErrorMessage name="code" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                {isSubmitting ? "Verifying…" : "Verify"}
              </button>
            </Form>
          )}
        </Formik>

        <div className="text-center mt-6">
          <Link href="/login" className="text-blue-500 hover:underline">
            Go to login
          </Link>
        </div>
      </div>
    </main>
  );
}
