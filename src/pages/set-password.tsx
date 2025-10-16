"use client";

import React, { useMemo, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/router";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { getAccessToken } from "@/utils/authTokens";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://dianagloballoginregister-52599bd07634.herokuapp.com";

const PASSWORD_RULE = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;

type Msg = { type: "ok" | "err"; text: string } | null;

const SetPasswordPage: React.FC = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);

  const schema = useMemo(
    () =>
      Yup.object({
        password: Yup.string()
          .matches(
            PASSWORD_RULE,
            "Password must be at least 8 characters and include 1 uppercase letter, 1 lowercase letter, and 1 digit."
          )
          .required("Please enter a new password"),
      }),
    []
  );

  async function doRefresh(): Promise<boolean> {
    try {
      const csrf = sessionStorage.getItem("dg.csrf") || "";
      const res = await fetch(`${API_BASE}/api/auth/refresh-token`, {
        method: "POST",
        credentials: "include",
        headers: { Accept: "application/json", "X-CSRF-Token": csrf },
      });
      if (!res.ok) return false;

      const json = await res.json().catch(() => null);
      if (json?.access) {
        try {
          localStorage.setItem("access_token", json.access);
        } catch {}
      }

      const newCsrf = res.headers.get("X-CSRF-Token") || "";
      if (newCsrf) sessionStorage.setItem("dg.csrf", newCsrf);

      return true;
    } catch {
      return false;
    }
  }

  async function callSetPassword(newPassword: string): Promise<Response> {
    const access = (await getAccessToken()) || localStorage.getItem("access_token") || "";
    return fetch(`${API_BASE}/api/auth/password/set`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ newPassword }),
    });
  }

  const handleSubmit = async (values: { password: string }) => {
    setMsg(null);

    let res = await callSetPassword(values.password);

    if (res.status === 401) {
      const ok = await doRefresh();
      if (ok) res = await callSetPassword(values.password);
    }

    if (res.ok) {
      setMsg({
        type: "ok",
        text:
          "Password created successfully. You can now sign in using e-mail and password as well.",
      });
      setTimeout(() => router.push("/protected/dashboard"), 3000);
      return;
    }

    let text = "Could not set your password. Please try again.";
    try {
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const j = await res.json();
        text = j?.message || j?.detail || text;
      } else {
        text = (await res.text()) || text;
      }
    } catch {}
    setMsg({ type: "err", text });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-black">
      <div className="bg-white dark:bg-gray-900 p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-black dark:text-white">
          Create your password
        </h1>

        {/* validateOnChange já é true por padrão; removemos a dependência de touched */}
        <Formik initialValues={{ password: "" }} validationSchema={schema} onSubmit={handleSubmit}>
          {({ isSubmitting, isValid }) => (
            <Form className="space-y-4">
              <div className="space-y-1">
                <div className="relative">
                  <Field
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="New password (min 8, 1 uppercase, 1 lowercase, 1 digit)"
                    className="w-full h-11 px-3 pr-12 border border-gray-300 rounded text-black"
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
                <ErrorMessage name="password" component="div" className="text-red-500 text-sm" />
                <p className="text-xs text-gray-600">
                  Requirements: at least <strong>8 characters</strong>, including{" "}
                  <strong>1 uppercase</strong>, <strong>1 lowercase</strong>, and <strong>1 digit</strong>.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !isValid}
                className={`w-full py-2 px-4 rounded transition ${
                  isSubmitting || !isValid
                    ? "bg-blue-300 cursor-not-allowed text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                Save password
              </button>

              {msg && (
                <p className={`text-sm text-center ${msg.type === "ok" ? "text-green-600" : "text-red-600"}`}>
                  {msg.text}
                </p>
              )}
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default SetPasswordPage;
