"use client";
import React, { useContext, useState, useEffect } from 'react';
import { PriceCoinsContext, PriceCoinsProvider } from '../../components/CryptoTracker/PriceCoins';
import { PriceChangeContext, PriceChangeProvider } from '../../components/CryptoTracker/PriceChange';
import { signOut, useSession, getSession } from 'next-auth/react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import WelcomeComponent from '@/components/DashboardComponents/WelcomeComponent';
import YourPortfolio from '@/components/DashboardComponents/YourPortfolio';
import EstimatedBalance from '@/components/DashboardComponents/EstimatedBalance';
import { fetchBtcAddress, fetchSolAddress, fetchDogeAddress, fetchDianaAddress } from '@/utils/TryGetCoins';

interface DashboardProps {
  userId: string;
  name: string;
}

const useClearLocalStorageOnUnmount = () => {
  useEffect(() => {
    const clearLocalStorage = () => {
      localStorage.removeItem('userId');
      localStorage.removeItem('name');
    };

    window.addEventListener('beforeunload', clearLocalStorage);

    return () => {
      window.removeEventListener('beforeunload', clearLocalStorage);
      clearLocalStorage(); // Limpa imediatamente ao desmontar o componente
    };
  }, []);
};

const Dashboard: React.FC<DashboardProps> = ({ userId: initialUserId, name: initialName }) => {
  const { data: session, status } = useSession();
  const [showValues, setShowValues] = useState(false);
  const [userId, setUserId] = useState(initialUserId);
  const [name, setName] = useState(initialName);
  const [storedUserId, setStoredUserId] = useState<string | null>(initialUserId);
  const [storedName, setStoredName] = useState<string | null>(initialName);
  const [btcAddress, setBtcAddress] = useState<string | null>(null);
  const [solAddress, setSolAddress] = useState<string | null>(null);
  const [dogeAddress, setDogeAddress] = useState<string | null>(null);
  const [dianaAddress, setDianaAddress] = useState<string | null>(null);
  const router = useRouter();

  // Limpa o localStorage e os cookies ao desmontar o componente ou sair da página
  useClearLocalStorageOnUnmount();

  const clearLocalStorage = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('name');
    setStoredUserId(null);
    setStoredName(null);
  };

  useEffect(() => {
    if (initialUserId && initialName) {
      setUserId(initialUserId);
      setName(initialName);
      localStorage.setItem('userId', initialUserId);
      localStorage.setItem('name', initialName);
    }
  }, [initialUserId, initialName]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userId = localStorage.getItem('userId');
      const name = localStorage.getItem('name');

      if (userId && name) {
        setStoredUserId(userId);
        setStoredName(name);
      } else if (session?.user?.id && session?.user?.name) {
        localStorage.setItem('userId', session.user.id);
        localStorage.setItem('name', session.user.name);
        setStoredUserId(session.user.id);
        setStoredName(session.user.name);
      } else {
        clearLocalStorage();
      }
    }
  }, [session]);

  useEffect(() => {
    const loadFromLocalStorage = () => {
      if (typeof window !== 'undefined') {
        const storedBtcAddress = localStorage.getItem(`btcAddress_${userId}`);
        const storedSolAddress = localStorage.getItem(`solAddress_${userId}`);
        const storedDogeAddress = localStorage.getItem(`dogeAddress_${userId}`);
        const storedDianaAddress = localStorage.getItem(`dianaAddress_${userId}`);
        if (storedBtcAddress) {
          setBtcAddress(storedBtcAddress);
        }
        if (storedSolAddress) {
          setSolAddress(storedSolAddress);
        }
        if (storedDogeAddress) {
          setDogeAddress(storedDogeAddress);
        }
        if (storedDianaAddress) {
          setDianaAddress(storedDianaAddress);
        }
      }
    };
    loadFromLocalStorage();
  }, [userId]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchBtcAddress(session.user.id as string, setBtcAddress);
      fetchSolAddress(session.user.id as string, setSolAddress);
      fetchDogeAddress(session.user.id as string, setDogeAddress);
      fetchDianaAddress(session.user.id as string, setDianaAddress);
    }
  }, [session, btcAddress, solAddress, dogeAddress, dianaAddress]); // Dependências: session e endereços

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
    clearLocalStorage();
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center text-center p-4 text-black dark:bg-black dark:text-white">
      <WelcomeComponent
        storedName={storedName}
        storedUserId={storedUserId}
        handleLogout={handleLogout}
      />
      <EstimatedBalance
        showValues={showValues}
        setShowValues={setShowValues}
        storedUserId={storedUserId}
        storedName={storedName}
        btcAddress={btcAddress}
        solAddress={solAddress}
        dogeAddress={dogeAddress}
        dianaAddress={dianaAddress}
      />
      <YourPortfolio showValues={showValues} />
    </div>
  );
};

const DashboardWithProviders = (props: DashboardProps) => {
  return (
    <PriceCoinsProvider>
      <PriceChangeProvider>
        <Dashboard {...props} />
      </PriceChangeProvider>
    </PriceCoinsProvider>
  );
}

export default DashboardWithProviders;

export const getServerSideProps: GetServerSideProps<DashboardProps> = async (context) => {
  const session = await getSession(context);

  console.log('Session:', session); // Adicione este log para depuração

  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  const { id: userId, name } = session.user || {};

  console.log('Name:', name); // Adicione este log para depuração

  if (!userId || !name) {
    console.error('UserId or name is missing in session.user');
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