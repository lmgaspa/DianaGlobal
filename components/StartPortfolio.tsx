import React from 'react';

const StartPortfolio: React.FC = () => {
  return (
    <div style={{ height: "40vh" }} className="flex justify-between items-center p-8 bg-blue-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
      <div style={{ width: "40%", marginLeft: "15%" }}>
        <h1 className="text-5xl font-bold">Start your Crypto Portfolio Now!</h1>
      </div>
      <div style={{ width: "60%" }}>
        <p className="text-3xl mb-3">Open your account, it&apos;s easy and free</p>
        <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
          Create an Account
        </button>
      </div>
    </div>
  );
};

export default StartPortfolio;
