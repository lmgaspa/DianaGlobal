import React from 'react';
import { useRouter } from 'next/router';

const StartPortfolio: React.FC = () => {
  const router = useRouter();

  const SignUpClick = () => {
    router.push('/signup');
  };

  return (
    <div className="flex md:flex-row justify-between items-center 
    bg-blue-100 dark:bg-slate-600 text-gray-900 dark:text-gray-100" style={{ height: "40vh" }}>
      <div className="w-5/6 ml-10 pr-12 text-center md:text-left mb-2">
        <h1 className="text-4xl lg:text-5xl md:pl-6 lg:pl-12 lg:ml-12 font-bold">Start your Crypto Portfolio Now!</h1>
      </div>
      <div className="w-4/6 text-center md:text-left mr-12">
        <p className="text-xl md:text-3xl mb-2 mr-4">Open your account, it&apos;s easy and free</p>
        <button
          className="bg-blue-500 hover:bg-green-500 transition duration-300 cursor-pointer text-white font-bold py-2 mt-2 px-4 rounded"
          onClick={SignUpClick}
        >
          Create an Account
        </button>
      </div>
    </div>
  );
};

export default StartPortfolio;
