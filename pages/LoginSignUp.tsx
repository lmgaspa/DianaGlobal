  import React, { useState } from 'react';
  import { Formik, Field, Form, ErrorMessage, FormikValues } from 'formik';
  import * as Yup from 'yup';
  import Link from 'next/link';
  import { useRouter } from 'next/router';
  import MyGoogleLogin from '../Register/Google';
  import '../app/globals.css';

  const LoginSignIn: React.FC = () => {
    const router = useRouter();
    const [loginError, setLoginError] = useState<string | null>(null);

    const validationSchema = Yup.object({
      email: Yup.string().email("Invalid email address").required("Email is required"),
      password: Yup.string().required("Password is required"),
    });

    const handleLogin = async (values: FormikValues) => {
      try {
        const response = await fetch('https://apilogin-mvf1.onrender.com/auth/authenticate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        });
    
        if (!response.ok) {
          const errorData = await response.json();
          setLoginError(`Login failed: ${errorData.message}`);
          throw new Error(`Login failed: ${errorData.message}`);
        }
    
        const data = await response.json();
        console.log('Login successful:', data);

        // Optionally, you can store the token in local storage or a state management solution
        // localStorage.setItem('token', data.token);

        // Navigate to the success page
        const userName = data.user.name;
        router.push('/LoginSucess', { query: { name: userName } });
      } catch (error) {
        // Handle errors during login
        console.error('Error during login:', error);
      }
    };

    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-black">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md dark:bg-gray-900">
          <h1 className="text-2xl font-bold mb-6 text-center dark:text-white">Sign In</h1>
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
                <div className="mb-4">
                  <Field
                    type="password"
                    name="password"
                    placeholder="Password"
                    className={`w-full p-2 border ${errors.password && touched.password ? "border-red-500" : "border-gray-300"} rounded`}
                  />
                  <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                  Continue
                </button>
                <p className="text-center text-sm mt-4 dark:text-white">
                  Don&apos;t have an account?
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
