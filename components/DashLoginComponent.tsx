import React from "react"
import { useRouter } from 'next/router';
import { signOut } from 'next-auth/react';
import '../app/globals.css';

const DashLoginComponent: React.FC = () => {
  const router = useRouter();
  const { userId } = router.query; // Obtendo o ID do usuário da query da rota
  const { email } = router.query as { email: string };

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' }); // Redireciona para a página inicial após logout
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-2xl font-bold mb-4">Login Successful</h1>
      {userId && (
        <p className="text-xl mb-4">
          Welcome, <br></br><br></br>
          your user ID is: <span className="text-red-500">{userId}!</span>
        </p>
      )}
      {email && (
        <p className="text-xl mb-4">
          E-mail:<span className="text-red-500"> {email}!</span>
        </p>
      )}
      <button
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4"
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  )
}

export default DashLoginComponent;
