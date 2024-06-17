import React from "react";
import { useRouter } from 'next/router';
import { signOut, useSession } from 'next-auth/react';
import '../../app/globals.css';

const DashLoginComponent: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  const userId = session?.user?.id;
  const email = session?.user?.email;

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-2xl font-bold mb-4">Login Successful</h1>
      {userId && (
        <p className="text-xl mb-4">
          Welcome, <br/><br/>
          your user ID is: <span className="text-red-500">{userId}</span>
        </p>
      )}
      {email && (
        <p className="text-xl mb-4">
          E-mail: <span className="text-red-500">{email}</span>
        </p>
      )}
      <button
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4"
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  );
};

export default DashLoginComponent;
