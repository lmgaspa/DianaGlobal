"use client";
import React, { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FaEye, FaEyeSlash } from "react-icons/fa";

/** Strong password rule: min 8, >=1 uppercase, >=1 lowercase, >=6 digits */
const PASSWORD_RULE = /^(?=.*[A-Z])(?=.*[a-z])(?=(?:.*\d){6,}).{8,}$/;
const PASSWORD_RULE_TEXT =
  "Password must be at least 8 characters and include 1 uppercase letter, 1 lowercase letter, and 6 digits.";

type Msg = { type: "ok" | "err"; text: string } | null;

const ResetPasswordPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Token present -> forgot-password reset mode
  const token = useMemo(() => searchParams?.get("token") ?? "", [searchParams]);
  const isTokenMode = Boolean(token);

  // If no token, try to detect an access token for the authenticated change flow
  const accessToken =
    typeof window !== "undefined" ? localStorage.getItem("access_token") || "" : "";

  const isChangeMode = !isTokenMode && !!accessToken;

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);

  // Schemas
  const resetSchema = Yup.object({
    password: Yup.string()
      .min(8, "Password must be at least 8 characters long")
      .matches(PASSWORD_RULE, PASSWORD_RULE_TEXT)
      .required("Please enter a new password"),
  });

  const changeSchema = Yup.object({
    currentPassword: Yup.string().required("Please enter your current password"),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters long")
      .matches(PASSWORD_RULE, PASSWORD_RULE_TEXT)
      .required("Please enter a new password"),
  });

  const handleSubmit = async (values: { currentPassword?: string; password: string }) => {
    setMsg(null);

    try {
      let res: Response;

      if (isTokenMode) {
        // Forgot-password reset (no auth header)
        res = await fetch(
          "https://dianagloballoginregister-52599bd07634.herokuapp.com/api/auth/reset-password",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, newPassword: values.password }),
          }
        );
      } else if (isChangeMode) {
        // Authenticated change password (requires backend endpoint)
        res = await fetch(
          "https://dianagloballoginregister-52599bd07634.herokuapp.com/api/auth/change-password",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              currentPassword: values.currentPassword,
              newPassword: values.password,
            }),
          }
        );
      } else {
        setMsg({
          type: "err",
          text:
            "Missing token and not authenticated. Open the link from your e-mail or sign in to change your password.",
        });
        return;
      }

      if (res.ok) {
        setMsg({
          type: "ok",
          text: isTokenMode
            ? "Password changed successfully. You can sign in now."
            : "Password updated successfully.",
        });

        // Clear any stale tokens to force a clean login
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        setTimeout(() => {
          router.push(isTokenMode ? "/login" : "/");
        }, 1200);
      } else {
        const ct = res.headers.get("content-type") || "";
        let text =
          "Request failed. If you used a link, it may be invalid or expired. If you’re signed in, recheck your current password.";
        try {
          if (ct.includes("application/json")) {
            const j = await res.json();
            text = j?.message || j?.detail || text;
          } else {
            text = (await res.text()) || text;
          }
        } catch {
          // keep default text
        }
        setMsg({ type: "err", text });
      }
    } catch (e) {
      setMsg({ type: "err", text: "Network error. Please try again." });
    }
  };

  const title = isTokenMode
    ? "Set a new password"
    : isChangeMode
    ? "Change your password"
    : "Set a new password";

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-black">
      <div className="bg-white dark:bg-gray-900 p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-black dark:text-white">{title}</h1>

        {!isTokenMode && !isChangeMode ? (
          <p className="text-red-600 text-center">
            Missing token and no active session. Use the link from your e-mail or sign in to change your password.
          </p>
        ) : (
          <Formik
            initialValues={{ currentPassword: "", password: "" }}
            validationSchema={isChangeMode ? changeSchema : resetSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, isValid, touched }) => (
              <Form className="space-y-4">
                {isChangeMode && (
                  <div className="relative">
                    <Field
                      name="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Current password"
                      className="w-full p-2 border border-gray-300 rounded text-black pr-10"
                      autoComplete="current-password"
                    />
                    <span
                      className="absolute right-3 top-3 text-gray-600 cursor-pointer"
                      onClick={() => setShowCurrentPassword((v) => !v)}
                      aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
                      title={showCurrentPassword ? "Hide current password" : "Show current password"}
                    >
                      {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                    <ErrorMessage name="currentPassword" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                )}

                <div className="relative">
                  <Field
                    name="password"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="New password (min 8, 1 uppercase, 1 lowercase, 6 digits)"
                    className="w-full p-2 border border-gray-300 rounded text-black pr-10"
                    autoComplete="new-password"
                  />
                  <span
                    className="absolute right-3 top-3 text-gray-600 cursor-pointer"
                    onClick={() => setShowNewPassword((v) => !v)}
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                    title={showNewPassword ? "Hide password" : "Show password"}
                  >
                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                  <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
                  <p className="text-xs text-gray-600 mt-1">
                    Requirements: at least <strong>8 characters</strong>, including{" "}
                    <strong>1 uppercase</strong>, <strong>1 lowercase</strong>, and <strong>6 digits</strong>.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !isValid}
                  className={`w-full py-2 px-4 rounded transition ${
                    isSubmitting || !isValid
                      ? "bg-blue-300 cursor-not-allowed text-white"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                  }`}
                >
                  {isTokenMode ? "Save new password" : "Change password"}
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
