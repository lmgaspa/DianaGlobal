"use client";
import React from 'react';
import { useRouter } from 'next/router';

const RegisterSuccess: React.FC = () => {
  const router = useRouter();
  const { name } = router.query;

  const handleDashboardAccess = () => {
    router.push('/login');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-black">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md dark:bg-gray-900">
        <h1 className="text-2xl font-bold mb-6 text-center text-black dark:text-white">Welcome {name}</h1>
        <p className="text-center text-black dark:text-white">You are registered in our system.</p>
        <p className="text-center text-black dark:text-white">Press the Button for access the dashboard.</p>
        <div className="flex justify-center mt-4">
          <button
            onClick={handleDashboardAccess}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
          >
            Click for Back to Login Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterSuccess;

