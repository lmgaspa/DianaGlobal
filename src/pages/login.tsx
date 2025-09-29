"use client";

import React, { useState } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/router";
import { API_BASE } from "../lib/config";

interface LoginValues {
  email: string;
  password: string;
}

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export default function Login() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid e-mail address")
      .matches(EMAIL_REGEX, "E-mail must contain a valid domain")
      .required("E-mail is required"),
    password: Yup.string().required("Password is required"),
  });

  const onSubmit = async (values: LoginValues, helpers: any) => {
    setFormError(null);
    try {
      const { data } = await axios.post(`${API_BASE}/api/auth/login`, values, {
        headers: { Accept: "application/json", "Content-Type": "application/json" },
      });

      // Store tokens as you prefer (localStorage, cookies, etc.)
      localStorage.setItem("jwt", data.token);
      localStorage.setItem("refreshToken", data.refreshToken);

      router.push("/"); // or dashboard
    } catch (err: any) {
      const status = err?.response?.status;
      const message = err?.response?.data?.message || "Login failed. Please try again.";

      if (status === 403) {
        // Block login if e-mail is not confirmed and offer resend flow
        const email = helpers?.values?.email?.trim().toLowerCase();
        setFormError("Please confirm your e-mail before logging in.");
        router.push({ pathname: "/check-email", query: { email } });
        return;
      }

      if (status === 401) {
        setFormError("Invalid credentials.");
        return;
      }

      setFormError(message);
    } finally {
      helpers.setSubmitting(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-black px-4">
      <div className="bg-white dark:bg-gray-900 p-8 rounded shadow w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-black dark:text-white">Sign in</h1>

        {formError && <p className="text-center text-red-600 text-sm mb-4">{formError}</p>}

        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <div className="mb-4">
                <Field
                  type="email"
                  name="email"
                  placeholder="E-mail address"
                  className="w-full p-2 border border-gray-300 rounded"
                  autoComplete="email"
                />
                <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              <div className="mb-4">
                <Field
                  type="password"
                  name="password"
                  placeholder="Password"
                  className="w-full p-2 border border-gray-300 rounded"
                  autoComplete="current-password"
                />
                <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-60"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in…" : "Sign In"}
              </button>
            </Form>
          )}
        </Formik>

        <div className="text-center text-sm mt-4 text-black dark:text-white">
          <Link href="/forgot-password" className="text-blue-600 hover:underline">
            Forgot your password?
          </Link>
        </div>

        <p className="text-center text-sm mt-4 text-black dark:text-white">
          Don’t have an account?{" "}
          <Link href="/signup" className="text-blue-600 hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
