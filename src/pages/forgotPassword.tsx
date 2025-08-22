"use client";
import React, { useState } from "react";
import { Formik, Field, Form, ErrorMessage, FormikValues } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import { useRouter } from "next/navigation";

const ForgetPassword: React.FC = () => {
  const router = useRouter();
  const [message, setMessage] = useState<{ type: string; text: string } | null>(
    null
  );

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
  });

  const handleForgotPassword = async (values: FormikValues) => {
  setMessage(null);
  try {
    const response = await fetch("https://dianagloballoginregister-52599bd07634.herokuapp.com/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: values.email }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Failed to send reset link.");
    }

    // ✅ agora vai para a tela de reset
    router.push(`/resetPassword?email=${encodeURIComponent(values.email)}`);
  } catch (error: any) {
    setMessage({ type: "error", text: error.message });
  }
};

  return (
    <div className="flex items-center justify-center min-h-screen h-screen text-black bg-gray-100 dark:bg-black pb-12">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md dark:bg-gray-900">
        <h1 className="text-2xl font-bold mb-6 text-center text-black dark:text-white">
          Forgot Password
        </h1>
        {message && (
          <p
            className={`text-sm text-center mb-4 ${
              message.type === "success" ? "text-green-500" : "text-red-500"
            }`}
          >
            {message.text}
          </p>
        )}
        <Formik
          initialValues={{ email: "" }}
          validationSchema={validationSchema}
          onSubmit={handleForgotPassword}
        >
          {({ errors, touched }) => (
            <Form>
              <div className="mb-4">
                <Field
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  className={`w-full p-2 border ${
                    errors.email && touched.email
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded`}
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                Send Reset Link
              </button>
              <p className="text-center text-sm mt-4 text-black dark:text-white">
                Remember your password?{" "}
                <Link href="/login">
                  <span className="text-blue-500 hover:underline cursor-pointer ml-1">
                    Sign In
                  </span>
                </Link>
              </p>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default ForgetPassword;
