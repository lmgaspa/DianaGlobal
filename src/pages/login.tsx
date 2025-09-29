"use client";

import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://dianagloballoginregister-52599bd07634.herokuapp.com";

const schema = Yup.object({
  email: Yup.string().email("Invalid e-mail").required("E-mail is required"),
  password: Yup.string().required("Password is required"),
});

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-black px-4">
      <div className="bg-white dark:bg-gray-900 p-8 rounded shadow max-w-md w-full">
        <h1 className="text-2xl font-semibold text-black dark:text-white mb-6 text-center">
          Login
        </h1>

        {error && <p className="text-center text-red-600 mb-4">{error}</p>}

        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={schema}
          onSubmit={async (values, { setSubmitting }) => {
            setError(null);
            try {
              const { data } = await axios.post(
                `${API_BASE}/api/auth/login`,
                values,
                { headers: { "Content-Type": "application/json" } }
              );

              // sucesso: guarde tokens se necessário e redirecione
              // localStorage.setItem("token", data.token);
              // localStorage.setItem("refreshToken", data.refreshToken);
              router.push("/"); // ajuste a rota pós-login
            } catch (err: any) {
              const status = err?.response?.status;
              const msg =
                err?.response?.data?.message ||
                err?.response?.data?.detail ||
                err?.message ||
                "Login failed.";

              if (status === 403) {
                // e-mail não confirmado -> leva para check-email com fallback
                try {
                  localStorage.setItem("pendingEmail", values.email);
                } catch {}
                router.push({
                  pathname: "/check-email",
                  query: { email: values.email },
                });
                return;
              }

              if (status === 401) {
                setError("Invalid e-mail or password.");
              } else if (status === 400) {
                setError("Bad request. Please review your data.");
              } else {
                setError(msg);
              }
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
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div className="mb-4 relative">
                <Field
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  className="w-full p-2 border border-gray-300 rounded pr-10"
                  autoComplete="current-password"
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

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:opacity-60"
              >
                {isSubmitting ? "Signing in…" : "Login"}
              </button>
            </Form>
          )}
        </Formik>

        <div className="text-center mt-6 text-sm text-black dark:text-white">
          Don’t have an account?{" "}
          <Link href="/signup" className="text-blue-500 hover:underline">
            Sign up
          </Link>
        </div>

        <div className="text-center mt-2">
          <Link
            href="/forgot-password"
            className="text-sm text-blue-500 hover:underline"
          >
            Forgot your password?
          </Link>
        </div>
      </div>
    </main>
  );
}
