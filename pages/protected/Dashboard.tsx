import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import '../../app/globals.css';
import React from 'react';
import EstimatedBalance from '@/components/DashBoardComponent/EstimatedBalance';
import DashLoginComponent from '@/components/DashBoardComponent/DashLoginComponent';

const Dashboard: React.FC = () => (
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

export default Dashboard;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
};
