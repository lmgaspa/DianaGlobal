"use client";
import React, { useState } from "react";
import { Formik, Field, Form, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/router";
import { FaEye, FaEyeSlash } from "react-icons/fa";

interface SignUpValues {
  name: string;
  email: string;
  password: string;
}

const EMAIL_REGEX =
  /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/; // same as backend
const PASSWORD_REGEX =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/; // min 8, 1 upper, 1 lower, at least 1 digit

const PASSWORD_RULE_TEXT =
  "Password must be at least 8 characters and include 1 uppercase letter, 1 lowercase letter, and at least 1 digit.";

const SignUp: React.FC = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    email: Yup.string()
      .email("Invalid e-mail address")
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
      const apiUrl =
        "https://dianagloballoginregister-52599bd07634.herokuapp.com/api/auth/register";

      await axios.post(apiUrl, values, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      // Backend returns 200 with "User successfully registered"
      router.push({
        pathname: "/registersucess",
        query: { name: values.name },
      });
    } catch (err: any) {
      // Try to map backend validation errors (GlobalExceptionHandler -> errors map)
      const data = err?.response?.data;
      const status = err?.response?.status;

      if (status === 400 && data) {
        // Field-level errors map (e.g., { errors: { "email": "...", "password": "..." } })
        const fieldErrors = data?.errors;
        if (fieldErrors && typeof fieldErrors === "object") {
          const mapped: Partial<Record<keyof SignUpValues, string>> = {};
          if (fieldErrors.name) mapped.name = String(fieldErrors.name);
          if (fieldErrors.email) mapped.email = String(fieldErrors.email);
          if (fieldErrors.password) mapped.password = String(fieldErrors.password);
          setErrors(mapped);
        }

        // General message from backend
        const message =
          data?.message || data?.detail || "Registration failed. Please check your data.";
        setFormError(message);
      } else {
        setFormError(err?.message || "Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen h-screen text-black bg-gray-100 dark:bg-black pb-12">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md dark:bg-gray-900">
        <h1 className="text-2xl font-bold mb-6 text-center text-black dark:text-white">Sign Up</h1>

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
                <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
              </div>

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
                <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              <p className="text-xs text-gray-600 mb-4">
                Password  equirements: at least <strong>8 characters</strong>, including{" "}
                <strong>1 uppercase</strong>, <strong>1 lowercase</strong>, and{" "}
                <strong>at least 1 digit</strong>.
              </p>

              <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating account…" : "Sign Up!"}
              </button>
            </Form>
          )}
        </Formik>

        <p className="text-center text-sm mt-4 text-black dark:text-white">
          Already have an account?
          <Link href="/login">
            <span className="text-blue-500 hover:underline cursor-pointer ml-1">
              Login here!
            </span>
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
