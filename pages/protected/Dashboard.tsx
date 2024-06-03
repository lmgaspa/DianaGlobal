import '../../app/globals.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { signOut } from 'next-auth/react';
import EstimatedBalance from '@/components/EstimatedBalance';

const Dashboard: React.FC = () => {
  const router = useRouter();
  const { userId } = router.query; // Obtendo o ID do usuário da query da rota
  console.log(userId)
  const { email } = router.query as { email: string };
  
  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' }); // Redireciona para a página inicial após logout
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-black">
      <div className="flex">
        <div className="bg-white p-8 rounded shadow-md max-w-md text-center flex-1">
          <h1 className="text-2xl font-bold mb-4">Login Successful</h1>
          {userId && (
            <p className="text-xl mb-4">
              Welcome,
              your user ID is: <span className="text-red-500">{userId}!</span>
            </p>)}
          {email && (
            <p className="text-xl mb-4">
              Email:<span className="text-red-500"> {email}!</span>
            </p>
          )}
          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
        <EstimatedBalance />
      </div>
    </div>
  );
};

export default Dashboard;
