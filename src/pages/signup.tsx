"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { Formik, Field, Form, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/router";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import GoogleSignInButton from "@/components/GoogleSignInButton";

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

export default function SignUpPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    email: Yup.string()
      .email("Invalid e-mail")
      .matches(EMAIL_REGEX, "E-mail must contain a valid domain")
      .required("E-mail is required"),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters long")
      .matches(PASSWORD_REGEX, PASSWORD_RULE_TEXT)
      .required("Password is required"),
  });

  const handleSubmit = async (
    values: SignUpValues,
    { setSubmitting, setErrors }: FormikHelpers<SignUpValues>
  ) => {
    setFormError(null);
    try {
      const url = `${API_BASE}/api/auth/register`;
      await axios.post(url, values, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        // importante para status 201 não ser tratado como erro
        validateStatus: (s) => s >= 200 && s < 300,
      });

      // guarde um fallback local (caso user chegue em /check-email sem query)
      try {
        localStorage.setItem("pendingEmail", values.email);
      } catch {}

      router.push({
        pathname: "/check-email",
        query: { email: values.email },
      });
    } catch (err: any) {
      const status = err?.response?.status;
      const data = err?.response?.data;

      if (status === 400 && data) {
        // Map de erros de campo vindos do GlobalExceptionHandler
        const fieldErrors = data?.errors;
        if (fieldErrors && typeof fieldErrors === "object") {
          const mapped: Partial<Record<keyof SignUpValues, string>> = {};
          if (fieldErrors.name) mapped.name = String(fieldErrors.name);
          if (fieldErrors.email) mapped.email = String(fieldErrors.email);
          if (fieldErrors.password)
            mapped.password = String(fieldErrors.password);
          setErrors(mapped);
        }
        setFormError(
          data?.message ||
            data?.detail ||
            "Registration failed. Please check your data."
        );
      } else if (status === 409) {
        setFormError("This e-mail is already registered.");
      } else {
        setFormError(
          data?.message ||
            data?.detail ||
            err?.message ||
            "Something went wrong."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-black px-4">
      <div className="bg-white dark:bg-gray-900 p-8 rounded shadow w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-black dark:text-white">
          Create your account
        </h1>

        {formError && (
          <p className="text-center text-red-600 text-sm mb-4">{formError}</p>
        )}

        <Formik
          initialValues={{ name: "", email: "", password: "" }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <div className="mb-4">
                <Field
                  type="text"
                  name="name"
                  placeholder="Your name"
                  className="w-full p-2 border border-gray-300 rounded"
                  autoComplete="name"
                />
                <ErrorMessage
                  name="name"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div className="mb-4">
                <Field
                  type="email"
                  name="email"
                  placeholder="E-mail address"
                  className="w-full p-2 border border-gray-300 rounded"
                  autoComplete="email"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div className="mb-2 relative">
                <Field
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  className="w-full p-2 border border-gray-300 rounded pr-10"
                  autoComplete="new-password"
                />
                <span
                  className="absolute right-2 top-3 cursor-pointer text-gray-600"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <p className="text-xs text-gray-600 mb-4 dark:text-gray-300">
                Password requirements: at least <strong>8 characters</strong>,
                including <strong>1 uppercase</strong>,{" "}
                <strong>1 lowercase</strong>, and{" "}
                <strong>at least 1 digit</strong>.
              </p>

              <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:opacity-60"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating account…" : "Sign Up"}
              </button>
            </Form>
          )}
        </Formik>

        <p className="text-center text-sm mt-4 text-black dark:text-white">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>
        <main className="max-w-sm mx-auto p-4">
          <GoogleSignInButton callbackUrl="/protected/dashboard" />
          {/* Personalize o texto/estilo se quiser */}
          {/* <GoogleSignInButton label="Entrar com Google" className="mt-6" /> */}
        </main>
      </div>
    </main>
  );
}
