"use client";
import React, { useState } from 'react';
import { Formik, Field, Form, ErrorMessage, FormikValues } from 'formik';
import * as Yup from 'yup';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signIn, getSession } from 'next-auth/react';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // 👈 adicionado
import GoogleButton from '@/components/OtherComponents/GoogleButton';

const Login: React.FC = () => {
  const router = useRouter();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false); // 👈 controle da senha

  const validationSchema = Yup.object({
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string().required('Password is required'),
  });

  const handleLogin = async (values: FormikValues) => {
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: values.email,
        password: values.password,
      });

      if (result?.error) {
        throw new Error('Login failed: ' + result.error);
      }

      const session = await getSession();
      if (!session?.user || !('id' in session.user)) {
        throw new Error('Failed to retrieve user session');
      }

      const userId = session.user.id as string;
      console.log('este é o userId:' + userId);
      router.push({
        pathname: '/protected/dashboard',
        query: { userId: userId, email: values.email },
      });
    } catch (error: any) {
      setLoginError("Email or password are incorrect.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen h-screen text-black bg-gray-100 dark:bg-black pb-12">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md dark:bg-gray-900">
        <h1 className="text-2xl font-bold mb-6 text-center text-black dark:text-white">Sign In</h1>
        {loginError && (
          <p className="text-red-500 text-sm text-center mb-4">{loginError}</p>
        )}
        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={validationSchema}
          onSubmit={handleLogin}
        >
          {({ errors, touched }) => (
            <Form>
              <div className="mb-4">
                <Field
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  className={`w-full p-2 border ${errors.email && touched.email ? "border-red-500" : "border-gray-300"} rounded`}
                />
                <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
              </div>
              <div className="mb-4 relative">
                <Field
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  className={`w-full p-2 pr-10 border ${errors.password && touched.password ? "border-red-500" : "border-gray-300"} rounded`}
                />
                <span
                  className="absolute right-3 top-3 text-gray-600 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
                <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                Continue
              </button>
              <p className="text-center text-sm mt-4 text-black dark:text-white">
                <Link href="/forgotPassword">
                  <span className="text-blue-500 hover:underline cursor-pointer">Forgot Password?</span>
                </Link>
              </p>
              <p className="text-center text-sm mt-4 text-black dark:text-white">
                Don&apos;t have an account?
                <Link href="/signup">
                  <span className="text-blue-500 hover:underline cursor-pointer ml-1">Register here</span>
                </Link>
              </p>
              <div className="mt-4">
                {/* opcional: <GoogleButton /> */}
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Login;
