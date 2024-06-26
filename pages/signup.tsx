"use client";
import React from 'react';
import { Formik, Field, Form, ErrorMessage, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/router';
import GoogleButton from '@/components/OtherComponents/GoogleButton';

interface SignUpValues {
  name: string;
  email: string;
  password: string;
}

const SignUp: React.FC = () => {
  const router = useRouter();

  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  });

  const handleSubmit = async (
    values: SignUpValues,
    { setSubmitting }: FormikHelpers<SignUpValues>
  ) => {
    try {
      const apiUrl = 'https://apilogin-mvf1.onrender.com/auth/register';
  
      const response = await axios.post(apiUrl, values, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
  
      console.log('User creation successful:', response.data);
  
      router.push({
        pathname: '/registersucess',
        query: { name: values.name },
      });
    } catch (error) {
      console.error('Error creating user:', (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen text-black bg-gray-100 dark:bg-black">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md dark:bg-gray-900">
        <h1 className="text-2xl font-bold mb-6 text-center text-black dark:text-white">Sign Up</h1>
        <Formik
          initialValues={{ name: '', email: '', password: '' }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <div className="mb-4">
                <Field
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  className="w-full p-2 border border-gray-300 rounded"
                />
                <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
              </div>
              <div className="mb-4">
                <Field
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  className="w-full p-2 border border-gray-300 rounded"
                />
                <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
              </div>
              <div className="mb-4">
                <Field
                  type="password"
                  name="password"
                  placeholder="Password"
                  className="w-full p-2 border border-gray-300 rounded"
                />
                <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                disabled={isSubmitting}
              >
                Sign Up!
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
        <div className="mt-4">
        </div>
      </div>
    </div>
  );
};

export default SignUp;