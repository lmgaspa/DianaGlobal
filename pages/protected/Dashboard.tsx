"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { useSession, getSession } from 'next-auth/react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import WelcomeComponent from '@/components/DashboardComponents/WelcomeComponent';
import YourPortfolio from '@/components/DashboardComponents/YourPortfolio';
import EstimatedBalance from '@/components/DashboardComponents/EstimatedBalance';
import { fetchAllUserAddresses } from '@/utils/TryGetCoins';
import { handleLogout } from '@/utils/authUtils';

interface DashboardProps {
  userId: string;
  name: string;
}

const Dashboard: React.FC<DashboardProps> = ({ userId: initialUserId, name: initialName }) => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [showValues, setShowValues] = useState(false);
  const [userId, setUserId] = useState(initialUserId);
  const [name, setName] = useState(initialName);
  const [storedUserId, setStoredUserId] = useState<string | null>(null);
  const [storedName, setStoredName] = useState<string | null>(null);
  const [btcAddress, setBtcAddress] = useState<string | null>(null);
  const [solAddress, setSolAddress] = useState<string | null>(null);
  const [dogeAddress, setDogeAddress] = useState<string | null>(null);
  const [dianaAddress, setDianaAddress] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadFromLocalStorage = () => {
      const userId = localStorage.getItem('userId');
      const name = localStorage.getItem('name');
      const storedBtcAddress = localStorage.getItem(`btcAddress_${userId}`);
      const storedSolAddress = localStorage.getItem(`solAddress_${userId}`);
      const storedDogeAddress = localStorage.getItem(`dogeAddress_${userId}`);
      const storedDianaAddress = localStorage.getItem(`dianaAddress_${userId}`);

      if (userId && name) {
        setStoredUserId(userId);
        setStoredName(name);
        setUserId(userId);
        setName(name);
        setBtcAddress(storedBtcAddress);
        setSolAddress(storedSolAddress);
        setDogeAddress(storedDogeAddress);
        setDianaAddress(storedDianaAddress);
      }
      setLoading(false); // Ensure loading is set to false once data is loaded
    };

    loadFromLocalStorage();
  }, []);

  useEffect(() => {
    if (session?.user?.id && session?.user?.name) {
      localStorage.setItem('userId', session.user.id);
      localStorage.setItem('name', session.user.name);
      setStoredUserId(session.user.id);
      setStoredName(session.user.name);
      setUserId(session.user.id);
      setName(session.user.name);
      setLoading(false); // Ensure loading is set to false once data is loaded
    } else {
      handleLogout();
    }
  }, [session]);

  useEffect(() => {
    if (btcAddress) localStorage.setItem(`btcAddress_${userId}`, btcAddress);
    if (solAddress) localStorage.setItem(`solAddress_${userId}`, solAddress);
    if (dogeAddress) localStorage.setItem(`dogeAddress_${userId}`, dogeAddress);
    if (dianaAddress) localStorage.setItem(`dianaAddress_${userId}`, dianaAddress);
  }, [btcAddress, solAddress, dogeAddress, dianaAddress, userId]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchAllUserAddresses(session.user.id as string, setBtcAddress, setSolAddress, setDogeAddress, setDianaAddress);
    }
  }, [session?.user?.id]);

  return (
    <div className="flex flex-col items-center text-center p-4 text-black dark:bg-black dark:text-white">
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
        btcAddress={btcAddress}
        solAddress={solAddress}
        dogeAddress={dogeAddress}
        dianaAddress={dianaAddress}
      />
      <YourPortfolio showValues={showValues} />
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
