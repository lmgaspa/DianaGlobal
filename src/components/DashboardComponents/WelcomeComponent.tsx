"use client";

import React from 'react';
import { handleLogout } from '@/utils/authUtils';

interface WelcomeComponentProps {
  storedName: string;
  storedUserId: string;
  loading: boolean;
}

const WelcomeComponent: React.FC<WelcomeComponentProps> = ({ storedName, storedUserId, loading }) => {
  if (loading) {
    return (
      <div className="w-full sm:w-2/3 p-4">
        <div className="sm:border sm:rounded-3xl-gray-300 p-6 rounded-3xl">
          <h2 className="text-xl font-bold mb-4">Waiting for the server to get your information...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full sm:w-2/3 p-4">
      <div className="sm:border sm:rounded-3xl-gray-300 p-6 rounded-3xl">
        <h2 className="text-xl font-bold mb-4">Welcome, {storedName}</h2>
        <p>Your user ID: {storedUserId}</p>
        <div className="w-full flex justify-center p-4">
          <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeComponent;
