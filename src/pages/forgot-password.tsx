"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const ResetPasswordPage = () => {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    if (!router.isReady) return;
    const t = typeof router.query.token === "string" ? router.query.token : "";
    setToken(t);
  }, [router.isReady, router.query.token]);

  // Rule: min 8 characters, >= 1 uppercase letter, >= 6 digits
  const validationSchema = Yup.object({
    password: Yup.string()
      .min(8, "Password must be at least 8 characters long")
      .matches(
        /^(?=.*[A-Z])(?=(?:.*\d){6,}).{8,}$/,
        "Password must include at least 1 uppercase letter and 6 digits"
      )
      .required("Please enter a new password"),
  });

  const handleSubmit = async (values: { password: string }) => {
    setMsg(null);

    const res = await fetch(
      "https://dianagloballoginregister-52599bd07634.herokuapp.com/api/auth/reset-password",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: values.password }),
      }
    );

    if (res.ok) {
      setMsg({ type: "ok", text: "Password changed successfully. You can sign in now." });
      setTimeout(() => router.push("/login"), 1500);
    } else {
      let text = "";
      try {
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          const j = await res.json();
          text = j?.message || j?.detail || "Invalid or expired link. Please request a new reset e-mail.";
        } else {
          text = (await res.text()) || "Invalid or expired link. Please request a new reset e-mail.";
        }
      } catch {
        text = "Invalid or expired link. Please request a new reset e-mail.";
      }
      setMsg({ type: "err", text });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-black">
      <div className="bg-white dark:bg-gray-900 p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-black dark:text-white">
          Set a new password
        </h1>

        {!token ? (
          <p className="text-red-600 text-center">
            Missing token. Please use the link from your e-mail.
          </p>
        ) : (
          <Formik initialValues={{ password: "" }} validationSchema={validationSchema} onSubmit={handleSubmit}>
            {({ isSubmitting, isValid, touched }) => (
              <Form className="space-y-4">
                <div className="relative">
                  <Field
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="New password (min 8, 1 uppercase and 6 digits)"
                    className="w-full p-2 border border-gray-300 rounded text-black pr-10"
                    autoComplete="new-password"
                  />
                  <span
                    className="absolute right-3 top-3 text-gray-600 cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                  <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
                  <p className="text-xs text-gray-600 mt-1">
                    Requirements: at least <strong>8 characters</strong>, including{" "}
                    <strong>1 uppercase letter</strong> and <strong>6 digits</strong>.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !isValid || !touched.password}
                  className={`w-full py-2 px-4 rounded transition ${
                    isSubmitting || !isValid || !touched.password
                      ? "bg-blue-300 cursor-not-allowed text-white"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                  }`}
                >
                  Save new password
                </button>

                {msg && (
                  <p className={`text-sm text-center ${msg.type === "ok" ? "text-green-600" : "text-red-600"}`}>
                    {msg.text}
                  </p>
                )}
              </Form>
            )}
          </Formik>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
