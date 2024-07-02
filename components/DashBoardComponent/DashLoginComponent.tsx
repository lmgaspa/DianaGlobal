// DashLoginComponent.tsx
import React from 'react';
import { signOut, useSession } from 'next-auth/react';
import useClearLocalStorageOnLogout from '@/hooks/useClearLocalStorageOnLogout'

interface DashLoginProps {
  userId: string;
  email: string;
}

const DashLoginComponent: React.FC<DashLoginProps> = ({ userId, email }) => {
  const { data: session, status } = useSession();

  // Função para lidar com o logout
  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
    // Limpeza adicional, se necessário
  };

  // Use o hook useClearLocalStorageOnLogout, passando handleLogout como argumento
  useClearLocalStorageOnLogout(handleLogout);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-2xl font-bold mb-4">Login Successful</h1>
      <p className="text-xl mb-4">
        Welcome, <br /><br />
        your user ID is: <span className="text-red-500">{userId}</span>
      </p>
      <p className="text-xl mb-4">
        E-mail: <span className="text-red-500">{email}</span>
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
