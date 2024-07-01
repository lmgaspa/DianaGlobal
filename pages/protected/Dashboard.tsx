import React, { useEffect, useState } from "react";
import EstimatedBalance from '@/components/DashBoardComponent/EstimatedBalance';
import DashLoginComponent from '@/components/DashBoardComponent/DashLoginComponent';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { parseCookies, setCookie } from 'nookies';

interface DashboardProps {
  initialUserId: string;
  initialEmail: string;
}

const Dashboard: React.FC<DashboardProps> = ({ initialUserId, initialEmail }) => {
  const [userId, setUserId] = useState(initialUserId);
  const [email, setEmail] = useState(initialEmail);

  useEffect(() => {
    // Verificar se os dados estão no localStorage
    const storedUserId = localStorage.getItem('userId');
    const storedEmail = localStorage.getItem('email');

    if (storedUserId && storedEmail) {
      setUserId(storedUserId);
      setEmail(storedEmail);
    } else {
      // Armazenar os dados no localStorage
      localStorage.setItem('userId', userId);
      localStorage.setItem('email', email);
    }
  }, [userId, email]);

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

  let { id: userId, email } = session.user;

  // Se userId ou email estiverem faltando, tente recuperá-los dos cookies
  const cookies = parseCookies(context);
  userId = userId || cookies.userId;
  email = email || cookies.email;

  if (!userId || !email) {
    console.error('UserId or email is missing in session.user and cookies');
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  // Armazenar os dados em cookies
  setCookie(context, 'userId', userId, {
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
  });
  setCookie(context, 'email', email, {
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
  });

  return {
    props: {
      initialUserId: userId,
      initialEmail: email,
    },
  };
};

export default Dashboard;
