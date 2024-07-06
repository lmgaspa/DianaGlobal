import React, { useEffect } from "react";
import EstimatedBalance from '@/components/DashBoardComponent/EstimatedBalance';
import DashLoginComponent from '@/components/DashBoardComponent/DashLoginComponent';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';

interface DashboardProps {
  userId: string;
  email: string;
}

const useClearLocalStorageOnUnmount = () => {
  useEffect(() => {
    const clearLocalStorage = () => {
      localStorage.removeItem('userId');
      localStorage.removeItem('email');
    };

    window.addEventListener('beforeunload', clearLocalStorage);

    return () => {
      window.removeEventListener('beforeunload', clearLocalStorage);
      clearLocalStorage(); // Limpa imediatamente ao desmontar o componente
    };
  }, []);
};

const Dashboard: React.FC<DashboardProps> = ({ userId: initialUserId, email: initialEmail }) => {
  const [userId, setUserId] = React.useState(initialUserId);
  const [email, setEmail] = React.useState(initialEmail);

  // Limpa o localStorage e os cookies ao desmontar o componente ou sair da página
  useClearLocalStorageOnUnmount();

  // Atualiza userId e email quando as props mudarem
  useEffect(() => {
    if (initialUserId && initialEmail) {
      setUserId(initialUserId);
      setEmail(initialEmail);
      localStorage.setItem('userId', initialUserId);
      localStorage.setItem('email', initialEmail);
    }
  }, [initialUserId, initialEmail]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-black">
      <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4">
        <div className="bg-white p-8 rounded shadow-md w-96 h-96 text-center">
          <DashLoginComponent userId={userId} email={email} />
        </div>
        <div className="bg-blue-200 p-8 rounded shadow-md w-96 h-96 text-center">
          <EstimatedBalance userId={userId} email={email} />
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<DashboardProps> = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  const { id: userId, email } = session.user || {};

  if (!userId || !email) {
    console.error('UserId or email is missing in session.user');
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return {
    props: {
      userId,
      email,
    },
  };
};

export default Dashboard;