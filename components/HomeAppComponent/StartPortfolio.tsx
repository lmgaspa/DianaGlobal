import React from 'react';
import { useRouter } from 'next/router';

const StartPortfolio: React.FC = () => {
  const router = useRouter();

  const SignUpClick = () => {
    router.push('/signup');
  };

  return (
    <div className="flex md:flex-row justify-between items-center p-4 md:p-8
    bg-blue-100 dark:bg-gray-600 text-gray-900 dark:text-gray-100" style={{ height: "40vh" }}>
      <div className="w-5/6 ml-10 text-center md:text-left mb-2">
        <h1 className="text-5xl mr-4 font-bold">Start your Crypto Portfolio Now!</h1>
      </div>
      <div className="w-3/6 text-center md:text-left">
        <p className="text-xl md:text-3xl mb-2 mr-4">Open your account, it&apos;s easy and free</p>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          onClick={SignUpClick}
        >
          Create an Account
        </button>
      </div>
    </div>
  );
};

export default StartPortfolio;
