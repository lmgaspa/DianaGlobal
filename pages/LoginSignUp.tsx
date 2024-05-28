import React from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Link from 'next/link';
import { useRouter } from 'next/router';
import MyGoogleLogin from '../Register/Google';
import '../app/globals.css';

const LoginSignIn: React.FC = () => {
  const router = useRouter();

  const validationSchema = Yup.object({
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string().required('Password is required'),
  });

  const handleLogin = async (
    values: { email: string; password: string },
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    try {
      // Coloque aqui a lógica de autenticação
    } catch (error) {
      console.error('Error logging in:', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>
        <Formik
          initialValues={{ email: '', password: '' }}
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
                  className={`w-full p-2 border ${errors.email && touched.email ? 'border-red-500' : 'border-gray-300'} rounded`}
                />
                <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
              </div>
              <div className="mb-4">
                <Field
                  type="password"
                  name="password"
                  placeholder="Password"
                  className={`w-full p-2 border ${errors.password && touched.password ? 'border-red-500' : 'border-gray-300'} rounded`}
                />
                <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                Continue
              </button>
              <p className="text-center text-sm mt-4">
                Don't have an account?
                <Link href="/SignUp">
                  <span className="text-blue-500 hover:underline cursor-pointer ml-1">Register here</span>
                </Link>
              </p>
              <div className="mt-4">
                <MyGoogleLogin />
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default LoginSignIn;
