import '../../app/globals.css';
import React from "react";
import EstimatedBalance from '@/components/DashBoardComponent/EstimatedBalance';
import DashLoginComponent from '@/components/DashBoardComponent/DashLoginComponent';
import { GetServerSideProps } from 'next';

interface DashboardProps {
  userId: string;
  email: string;
}

const Dashboard: React.FC<DashboardProps> = ({ userId, email }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-black">
      <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4">
        <div className="bg-white p-8 rounded shadow-md w-96 h-96 text-center">
          <DashLoginComponent />
        </div>
        <div className="bg-blue-200 p-8 rounded shadow-md w-96 h-96 text-center">
          <EstimatedBalance />
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<DashboardProps> = async (context) => {
  const { userId, email } = context.query;

  if (!userId || !email || typeof userId !== 'string' || typeof email !== 'string') {
    return {
      notFound: true,
    };
  }

  // Simulando dados que você pode buscar de uma API ou banco de dados
  const userData: DashboardProps = { userId: userId as string, email: email as string };

  return {
    props: userData,
  };
};

export default Dashboard;



/*

'use client';
import '../../app/globals.css';
import React from "react";
import EstimatedBalance from '@/components/DashBoardComponent/EstimatedBalance';
import DashLoginComponent from '@/components/DashBoardComponent/DashLoginComponent';

const Dashboard: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-black">
      <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4">
        <div className="bg-white p-8 rounded shadow-md w-96 h-96 text-center">
          <DashLoginComponent />
        </div>
        <div className="bg-blue-200 p-8 rounded shadow-md w-96 h-96 text-center">
          <EstimatedBalance />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

*/