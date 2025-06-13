'use client';

import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import { useSession, getSession } from 'next-auth/react';
import WelcomeComponent from '@/components/DashboardComponents/WelcomeComponent';
import YourPortfolio from '@/components/DashboardComponents/YourPortfolio';
import EstimatedBalance from '@/components/DashboardComponents/EstimatedBalance';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useSessionHandler } from '@/hooks/useSessionHandler';
import { useAddressStorage } from '@/hooks/useAddressStorage';
import { useAddressFetcher } from '@/hooks/useAddressFetcher';
import SidebarActions from '../../components/OtherComponents/SidebarActions';

interface DashboardProps {
  userId: string;
  name: string;
}

const Dashboard: React.FC<DashboardProps> = ({ userId: initialUserId, name: initialName }) => {
  const { loading, userId, name } = useSessionHandler();
  const {
    storedUserId,
    storedName,
    btcAddress,
    solAddress,
    dogeAddress,
    dianaAddress,
    setBtcAddress,
    setSolAddress,
    setDogeAddress,
    setDianaAddress
  } = useLocalStorage();
  
  useAddressStorage(userId, btcAddress, solAddress, dogeAddress, dianaAddress);
  useAddressFetcher(userId, setBtcAddress, setSolAddress, setDogeAddress, setDianaAddress);

  const [showValues, setShowValues] = useState(false);

  return (
    <div className="flex flex-col md:flex-row min-h-screen dark:bg-black dark:text-white">
      {/* Sidebar */}
      <SidebarActions
        userId={storedUserId || 'N/A'}
        name={storedName || 'Guest'}
        btcAddress={btcAddress || ''}
        solAddress={solAddress || ''}
        dogeAddress={dogeAddress || ''}
        dianaAddress={dianaAddress || ''}
      />

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col items-center p-4">
        <WelcomeComponent
          storedName={storedName || 'Guest'}
          storedUserId={storedUserId || 'N/A'}
          loading={loading}
        />
        <EstimatedBalance
          showValues={showValues}
          setShowValues={setShowValues}
          storedUserId={storedUserId || 'N/A'}
          storedName={storedName || 'Guest'}
          btcAddress={btcAddress || ''}
          solAddress={solAddress || ''}
          dogeAddress={dogeAddress || ''}
          dianaAddress={dianaAddress || ''}
        />
        <YourPortfolio
          showValues={showValues}
          btcAddress={btcAddress || ''}
          solAddress={solAddress || ''}
          dogeAddress={dogeAddress || ''}
          dianaAddress={dianaAddress || ''}
        />
      </div>
    </div>
  );
};

export default Dashboard;

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

  const { id: userId, name } = session.user || {};

  if (!userId || !name) {
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
      name,
    },
  };
};