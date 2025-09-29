"use client";

import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://dianagloballoginregister-52599bd07634.herokuapp.com";

/** Keep these names in sync with your route guard/middleware */
const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

const schema = Yup.object({
  email: Yup.string()
    .email("Invalid e-mail")
    .required("E-mail is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters long")
    .matches(
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/,
      "Password must include at least 1 uppercase letter, 1 lowercase letter, and 1 digit"
    )
    .required("Password is required"),
});

export default function LoginPage() {
  const router = useRouter();
  const [serverErr, setServerErr] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);
  const [pwVisible, setPwVisible] = useState(false);

  const goDashboard = () => {
    // Use replace to avoid going back to / on browser back
    router.replace("/protected/dashboard");
  };

  const saveTokens = (access: string, refresh: string) => {
    try {
      localStorage.setItem(ACCESS_KEY, access);
      localStorage.setItem(REFRESH_KEY, refresh);
    } catch {
      /* noop */
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-black px-4">
      <div className="bg-white dark:bg-gray-900 p-8 rounded shadow w-full max-w-md">
        <h1 className="text-2xl font-semibold text-center text-black dark:text-white mb-6">
          Sign in
        </h1>

        {serverErr && (
          <p className="text-center text-red-600 text-sm mb-4">{serverErr}</p>
        )}

        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={schema}
          onSubmit={async (values) => {
            setServerErr(null);
            setSubmitting(true);
            try {
              const res = await axios.post(
                `${API_BASE}/api/auth/login`,
                {
                  email: values.email.trim().toLowerCase(),
                  password: values.password,
                },
                { headers: { "Content-Type": "application/json" } }
              );

              // Backend returns { jwt, refreshToken }
              const access = res.data?.jwt ?? res.data?.accessToken;
              const refresh = res.data?.refreshToken;

              if (!access || !refresh) {
                throw new Error("Unexpected response from server");
              }

              saveTokens(access, refresh);
              goDashboard();
            } catch (err: any) {
              const status = err?.response?.status;
              const msg =
                err?.response?.data?.message ||
                err?.response?.data?.detail ||
                err?.message ||
                "Unable to sign in.";

              if (status === 403) {
                // Not confirmed: route user to the “check e-mail” page with masked e-mail
                router.push({
                  pathname: "/check-email",
                  query: { email: (values.email || "").trim().toLowerCase() },
                });
              } else if (status === 401) {
                setServerErr("Invalid e-mail or password.");
              } else {
                setServerErr(msg);
              }
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {() => (
            <Form className="space-y-4">
              <div>
                <Field
                  type="email"
                  name="email"
                  placeholder="E-mail"
                  autoComplete="email"
                  className="w-full p-2 border border-gray-300 rounded text-black"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div className="relative">
                <Field
                  type={pwVisible ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  autoComplete="current-password"
                  className="w-full p-2 border border-gray-300 rounded text-black pr-10"
                />
                <button
                  type="button"
                  onClick={() => setPwVisible((v) => !v)}
                  className="absolute right-3 top-2 text-sm text-gray-600"
                  aria-label={pwVisible ? "Hide password" : "Show password"}
                >
                  {pwVisible ? "Hide" : "Show"}
                </button>
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:opacity-60"
              >
                {isSubmitting ? "Signing in…" : "Sign in"}
              </button>
            </Form>
          )}
        </Formik>

        <div className="text-center mt-4">
          <Link href="/forgot" className="text-sm text-blue-500 hover:underline">
            Forgot your password?
          </Link>
        </div>

        <p className="text-center text-sm mt-6 text-black dark:text-white">
          Don’t have an account?
          <Link href="/signup" className="ml-1 text-blue-500 hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
