import React, { useEffect, useState } from "react";
import { useRouter } from 'next/router';
import { signOut, useSession } from 'next-auth/react';
import '../../app/globals.css';

const DashLoginComponent: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [storedUserId, setStoredUserId] = useState<string | null>(null);
  const [storedEmail, setStoredEmail] = useState<string | null>(null);

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    setStoredUserId(null);
    setStoredEmail(null);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userId = localStorage.getItem('userId');
      const email = localStorage.getItem('email');
      if (userId && email) {
        setStoredUserId(userId);
        setStoredEmail(email);
      }
    }
  }, []);

  useEffect(() => {
    if (session?.user?.id && session?.user?.email) {
      localStorage.setItem('userId', session.user.id);
      localStorage.setItem('email', session.user.email);
      setStoredUserId(session.user.id);
      setStoredEmail(session.user.email);
    }
  }, [session]);

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-2xl font-bold mb-4">Login Successful</h1>
      {storedUserId && (
        <p className="text-xl mb-4">
          Welcome, <br/><br/>
          your user ID is: <span className="text-red-500">{storedUserId}</span>
        </p>
      )}
      {storedEmail && (
        <p className="text-xl mb-4">
          E-mail: <span className="text-red-500">{storedEmail}</span>
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
