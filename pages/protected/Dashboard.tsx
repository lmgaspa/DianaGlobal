import React, { useEffect, useState } from "react";
import EstimatedBalance from '@/components/DashBoardComponent/EstimatedBalance';
import DashLoginComponent from '@/components/DashBoardComponent/DashLoginComponent';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';

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
    console.log('storedUserId:', storedUserId);
    console.log('storedEmail:', storedEmail);

    if (storedUserId && storedEmail) {
      setUserId(storedUserId);
      setEmail(storedEmail);
    } else {
      // Armazenar os dados no localStorage
      console.log('Setting localStorage userId and email');
      localStorage.setItem('userId', userId);
      localStorage.setItem('email', email);
    }
  }, [userId, email]);

  console.log('Rendering Dashboard with userId:', userId, 'and email:', email);

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
  console.log('Session:', session);

  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  const { id: userId, email } = session.user;

  if (!userId || !email) {
    console.error('UserId ou email estão ausentes em session.user');
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return {
    props: {
      initialUserId: userId,
      initialEmail: email,
    },
  };
};

export default Dashboard;
