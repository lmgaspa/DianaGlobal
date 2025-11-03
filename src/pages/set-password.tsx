"use client";

import React, { useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { Formik, Field, Form, ErrorMessage, FormikValues } from "formik";
import * as Yup from "yup";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://dianagloballoginregister-52599bd07634.herokuapp.com";

const PASSWORD_RULE = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;

type Msg = { type: "ok" | "err"; text: string } | null;

const SetPasswordPage: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validationSchema = Yup.object({
    password: Yup.string()
      .matches(
        PASSWORD_RULE,
        "Password must be at least 8 characters and include 1 uppercase letter, 1 lowercase letter, and 1 digit."
      )
      .required("Please enter a new password"),
  });

  // Função para detectar email automaticamente
  const detectUserEmail = (): string | null => {
    // 1. Tentar pegar email da sessão NextAuth primeiro
    if (session?.user?.email) {
      console.log("Found email in NextAuth session:", session.user.email);
      return session.user.email;
    }
    
    // 2. Tentar pegar email dos cookies
    try {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        if (cookie.trim().startsWith('dg.pendingEmail=')) {
          const email = cookie.split('=')[1];
          console.log("Found email in cookies:", email);
          return email;
        }
      }
    } catch (e) {
      console.log("Could not read cookies:", e);
    }
    
    // 3. Tentar pegar email do localStorage
    try {
      const email = localStorage.getItem('dg.userEmail') || 
                   localStorage.getItem('dg.email') ||
                   localStorage.getItem('email');
      if (email) {
        console.log("Found email in localStorage:", email);
        return email;
      }
    } catch (e) {
      console.log("Could not read localStorage:", e);
    }
    
    // 4. Tentar pegar email da URL
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const email = urlParams.get('email');
      if (email) {
        console.log("Found email in URL:", email);
        return email;
      }
    } catch (e) {
      console.log("Could not read URL params:", e);
    }
    
    return null;
  };

  // Função para definir senha manualmente
  const handleSetPassword = async (values: FormikValues) => {
    setMsg(null);
    setIsProcessing(true);
    
    const email = detectUserEmail();
    if (!email) {
      setMsg({ type: "err", text: "Could not detect your email. Please try again." });
      setIsProcessing(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/v1/auth/password/set-unauthenticated`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ 
          newPassword: values.password,
          email: email 
        }),
        credentials: "include",
      });
      
      console.log("Manual password set response:", response.status);
      
      if (response.ok) {
        setIsSuccess(true);
        setMsg({
          type: "ok",
          text: "Password created successfully! You can now sign in using email and password as well.",
        });
        setTimeout(() => {
          router.push("/protected/dashboard");
        }, 3000);
      } else {
        const errorText = await response.text();
        console.log("Failed to set password:", errorText);
        setMsg({ type: "err", text: "Failed to set password. Please try again." });
      }
    } catch (error) {
      console.log("Error setting password:", error);
      setMsg({ type: "err", text: "Network error. Please try again." });
    } finally {
      setIsProcessing(false);
    }
  };

  // Se não há sessão válida e não consegue detectar email, redirecionar para login
  if (status === "unauthenticated" && !detectUserEmail()) {
    router.push("/login");
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen h-screen text-black bg-gray-100 dark:bg-black pb-12">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md dark:bg-gray-900">
        <h1 className="text-2xl font-bold mb-6 text-center text-black dark:text-white">
          Set your password
        </h1>

        <p className="text-sm text-center mb-6 text-gray-600 dark:text-gray-300">
          Your account was created using Google. Your email is already verified ✅,
          but you haven't set a password yet. You can create one now to also sign in using email and password.
        </p>

        {msg && (
          <p
            className={`text-sm text-center mb-4 ${
              msg.type === "ok" ? "text-green-500" : "text-red-500"
            }`}
          >
            {msg.text}
          </p>
        )}

        <Formik initialValues={{ password: "" }} validationSchema={validationSchema} onSubmit={handleSetPassword}>
          {({ errors, touched, isSubmitting }) => (
            <Form>
              <div className="mb-4">
                <div className="relative">
                  <Field
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="New password (min 8, 1 uppercase, 1 lowercase, 1 digit)"
                    className={`w-full p-2 pr-12 border ${
                      errors.password && touched.password ? "border-red-500" : "border-gray-300"
                    } rounded text-black`}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center text-slate-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
                <p className="text-xs text-gray-600 mt-1">
                  Requirements: at least <strong>8 characters</strong>, including{" "}
                  <strong>1 uppercase</strong>, <strong>1 lowercase</strong>, and <strong>1 digit</strong>.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isProcessing || isSuccess}
                className={`w-full py-2 px-4 rounded transition ${
                  isSuccess 
                    ? "bg-green-500 text-white cursor-not-allowed" 
                    : "bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-60"
                }`}
              >
                {isSuccess ? (
                  <span className="flex items-center justify-center gap-2">
                    <span>✓</span>
                    Password Set Successfully
                  </span>
                ) : isSubmitting || isProcessing ? (
                  "Setting password..."
                ) : (
                  "Set password"
                )}
              </button>

              <p className="text-center text-sm mt-4 text-black dark:text-white">
                Already have a password?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="text-blue-500 hover:underline ml-1"
                >
                  Sign in
                </button>
              </p>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default SetPasswordPage;