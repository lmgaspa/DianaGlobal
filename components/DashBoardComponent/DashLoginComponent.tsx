"use client";
import React, { useEffect, useState } from 'react';
import { signOut, useSession } from 'next-auth/react';

interface DashLoginProps {
  userId: string;
  email: string;
}

const DashLoginComponent: React.FC<DashLoginProps> = ({ userId, email }) => {
  const {data: session, status } = useSession();
  const [storedUserId, setStoredUserId] = useState<string | null>(null);
  const [storedEmail, setStoredEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearLocalStorage = () => {
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
      } else if (session?.user?.id && session?.user?.email) {
        localStorage.setItem('userId', session.user.id);
        localStorage.setItem('email', session.user.email);
        setStoredUserId(session.user.id);
        setStoredEmail(session.user.email);
      } else {
        clearLocalStorage();
      }

      setIsLoading(false); // Marcar o carregamento como concluído
    }
  }, [session]);

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
    clearLocalStorage();
  };

  if (isLoading || status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-2xl font-bold mb-4">Login Successful</h1>
      <p className="text-xl mb-4">
        Welcome, <br /><br />
        your user ID is: {storedUserId && (<span className="text-red-500">{storedUserId}</span>)} </p>
      <p className="text-xl mb-4">
        {storedEmail && (
          <>
            E-mail: <span className="text-red-500">{storedEmail}</span>
          </>
        )}
      </p>
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