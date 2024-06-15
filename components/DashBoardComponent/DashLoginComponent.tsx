import React, { useEffect, useState } from "react";
import { useRouter } from 'next/router';
import { signOut, useSession } from 'next-auth/react';
import { Session } from 'next-auth';
import { parseCookies, setCookie, destroyCookie } from 'nookies'; // Importando funções para trabalhar com cookies
import '../../app/globals.css';

const DashLoginComponent: React.FC = () => {
  const router = useRouter();
  const [sessionData, setSessionData] = useState<Session | null>(null);

  const { data: session, status } = useSession();

  useEffect(() => {
    // Verificar se há um cookie de sessão
    const savedSession = parseCookies(null)['session'];
    if (savedSession) {
      // Configurar a sessão com os dados salvos no cookie
      setSessionData(JSON.parse(savedSession));
    }
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      // Se a sessão estiver autenticada, salvar no cookie
      setCookie(null, 'session', JSON.stringify(session), {
        maxAge: 30 * 24 * 60 * 60, // 30 dias em segundos
        path: '/', // O cookie estará disponível em todo o site
      });
      // Atualizar o estado da sessão
      setSessionData(session);
    }
  }, [status, router, session]);

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
    // Limpar o cookie de sessão ao fazer logout
    destroyCookie(null, 'session');
    // Limpar o estado da sessão
    setSessionData(null);
  };

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  const userId = sessionData?.user?.id;
  const email = sessionData?.user?.email;

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
