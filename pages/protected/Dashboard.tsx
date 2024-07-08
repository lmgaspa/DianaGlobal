"use client";

import React, { useContext, useState, useEffect } from 'react';
import { PriceCoinsContext, PriceCoinsProvider } from '../../components/CryptoTracker/PriceCoins';
import { PriceChangeContext, PriceChangeProvider } from '../../components/CryptoTracker/PriceChange';
import Image from 'next/image';
import btc from '../../public/assets/images/btc.png';
import doge from '../../public/assets/images/doge.png';
import sol from '../../public/assets/images/sol.png';
import diana from '../../public/assets/images/diana.png';
import { IoEye } from 'react-icons/io5';
import { signOut, useSession, getSession } from 'next-auth/react';
import { GetServerSideProps } from 'next';
import axios from 'axios';
import { useRouter } from 'next/router';

interface NewDashboardProps {
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

type StaticImageData = {
  src: string;
  height: number;
  width: number;
  placeholder?: string;
};

interface Coin {
  name: string;
  symbol: 'BTC' | 'SOL' | 'DOGE' | 'DIANA';
  image: StaticImageData;
}

const coinData: Coin[] = [
  { name: 'BITCOIN', symbol: 'BTC', image: btc },
  { name: 'SOLANA', symbol: 'SOL', image: sol },
  { name: 'DOGECOIN', symbol: 'DOGE', image: doge },
  { name: 'DIANA', symbol: 'DIANA', image: diana },
];

interface CoinCardProps {
  coin: Coin;
  price: string;
  priceChange: number;
  showValues: boolean;
}

const CoinCard: React.FC<CoinCardProps> = ({ coin, price, priceChange, showValues }) => {
  const getPriceChangeColor = (priceChange: number) => {
    return { color: priceChange >= 0 ? 'green' : 'red' };
  };

  return (
    <div className="border-gray-300 mb-4 grid grid-cols-4 items-center rounded-md">
      <div className="flex items-center">
        <Image
          src={coin.image}
          alt={coin.symbol.toLowerCase()}
          width={30}
          height={30}
          objectFit="contain"
        />
        <div className="flex flex-row ml-1">
          <h1 className="text-sm font-bold">{coin.symbol}</h1>
          <h1 className="hidden text-sm text-gray-500 ml-1">{coin.name}</h1>
        </div>
      </div>
      <div className="text-center">
        <p>Amount</p>
        <p>{showValues ? '0' : '*****'}</p>
      </div>
      <div className="text-center">
        <p>Coin Price</p>
        <h1 className="text-sm font-bold" style={getPriceChangeColor(priceChange)}>
          ${price}
        </h1>
      </div>
      <div className="text-center">
        <p>24H Change</p>
        <h1 className="text-sm font-bold" style={getPriceChangeColor(priceChange)}>
          {priceChange > 0 ? '+' : ''}
          {(priceChange * 1).toFixed(2)}%
        </h1>
      </div>
    </div>
  );
};

const NewDashboard: React.FC<NewDashboardProps> = ({ userId: initialUserId, name: initialName }) => {
  const { data: session, status } = useSession();
  const coinsPriceContext = useContext(PriceCoinsContext);
  const priceChangeContext = useContext(PriceChangeContext);
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
    const fetchBtcAddress = async (userId: string) => {
      if (!btcAddress) {
        try {
          console.log('Fetching BTC address for userId:', userId);
          const response = await axios.post('https://solana-wallet-generator.onrender.com/api/create_btc_address', {
            userId: userId,
          });
          const { btcAddress } = response.data;
          if (btcAddress) {
            setBtcAddress(btcAddress);
            localStorage.setItem(`btcAddress_${userId}`, btcAddress);
            console.log('BTC Address:', btcAddress);
          } else {
            console.error('Endereço BTC não foi retornado.');
          }
        } catch (error) {
          console.error('Erro ao buscar endereço BTC:', error);
        }
      }
    };

    const fetchSolAddress = async (userId: string) => {
      if (!solAddress) {
        try {
          console.log('Fetching Solana address for userId:', userId);
          const response = await axios.post('https://solana-wallet-generator.onrender.com/api/create_sol_address', {
            userId: userId,
          });
          const { solAddress } = response.data;
          if (solAddress) {
            setSolAddress(solAddress);
            localStorage.setItem(`solAddress_${userId}`, solAddress);
            console.log('Solana Address:', solAddress);
          } else {
            console.error('Endereço Solana não foi retornado.');
          }
        } catch (error) {
          console.error('Erro ao buscar endereço Solana:', error);
        }
      }
    };

    const fetchDogeAddress = async (userId: string) => {
      if (!dogeAddress) {
        try {
          console.log('Fetching DOGE address for userId:', userId);
          const response = await axios.post('https://solana-wallet-generator.onrender.com/api/create_doge_address', {
            userId: userId,
          });
          const { dogeAddress } = response.data;
          if (dogeAddress) {
            setDogeAddress(dogeAddress);
            localStorage.setItem(`dogeAddress_${userId}`, dogeAddress);
            console.log('DOGE Address:', dogeAddress);
          } else {
            console.error('Endereço DOGE não foi retornado.');
          }
        } catch (error) {
          console.error('Erro ao buscar endereço DOGE:', error);
        }
      }
    };

    const fetchDianaAddress = async (userId: string) => {
      if (!dianaAddress) {
        try {
          console.log('Fetching Diana address for userId:', userId);
          const response = await axios.post('https://solana-wallet-generator.onrender.com/api/create_diana_address', {
            userId: userId,
          });
          const { dianaAddress } = response.data;
          if (dianaAddress) {
            setDianaAddress(dianaAddress);
            localStorage.setItem(`dianaAddress_${userId}`, dianaAddress);
            console.log('Diana Address:', dianaAddress);
          } else {
            console.error('Endereço Diana não foi retornado.');
          }
        } catch (error) {
          console.error('Erro ao buscar endereço Diana:', error);
        }
      }
    };

    if (session?.user?.id) {
      fetchBtcAddress(session.user.id as string);
      fetchSolAddress(session.user.id as string);
      fetchDogeAddress(session.user.id as string);
      fetchDianaAddress(session.user.id as string);
    }
  }, [session, btcAddress, solAddress, dogeAddress, dianaAddress]); // Dependências: session e endereços

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
    clearLocalStorage();
  };

  const handleDeposit = () => {
    router.push({
      pathname: '/protected/deposit',
      query: { userId: storedUserId, name: storedName, btcAddress, solAddress, dogeAddress, dianaAddress },
    });
  };

  const handleWithdraw = () => {
    router.push({
      pathname: '/protected/withdraw',
      query: { userId: storedUserId, name: storedName, btcAddress, solAddress, dogeAddress, dianaAddress },
    });
  };

  if (status === 'loading' || !coinsPriceContext || !priceChangeContext) {
    return <div>Loading...</div>;
  }

  const coinPrices = {
    BTC: coinsPriceContext.btcPrice,
    SOL: coinsPriceContext.solPrice,
    DOGE: coinsPriceContext.dogePrice,
    DIANA: coinsPriceContext.dianaPrice,
  };

  const coinPriceChanges = {
    BTC: priceChangeContext.btcPriceChange,
    SOL: priceChangeContext.solPriceChange,
    DOGE: priceChangeContext.dogePriceChange,
    DIANA: priceChangeContext.dianaPriceChange,
  };

  return (
    <div className="flex flex-col items-center text-center p-4 text-black dark:bg-black dark:text-white">
      <div className="w-full md:w-1/3 p-4">
        <div className="border border-gray-300 p-6 rounded-md">
          <h2 className="text-xl font-bold mb-4">Welcome, {storedName || name}</h2>
          <p>Your user ID: {storedUserId || userId}</p>
          <div className="w-full flex justify-center p-4">
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      <div className="w-full md:w-1/3 p-4 text-left">
        <div className="border border-gray-300 p-6 rounded-md flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <h2 className="text-xl font-bold">Estimated Balance</h2>
              <IoEye className="ml-1 mt-1 cursor-pointer" onClick={() => setShowValues(!showValues)} />
            </div>
            <div className="flex">
              <button className="bg-blue-500 text-white px-4 py-1 rounded-md mr-2" onClick={handleDeposit}>Deposit</button>
              <button className="bg-red-500 text-white px-4 py-1 rounded-md" onClick={handleWithdraw}>Withdraw</button>
            </div>
          </div>
          <div className="flex flex-col">
            <p>{showValues ? '0.00000000 BTC' : '*****'}</p>
            <p>{showValues ? '$ 0,00' : '*****'}</p>
          </div>
        </div>
      </div>
      <div className="w-full md:w-1/3 p-4">
        <div className="border border-gray-300 p-6 rounded-md">
          <h2 className="text-xl font-bold mb-4">Your Portfolio</h2>
          <div className="grid grid-cols-1">
            {coinData.map((coin) => (
              <CoinCard
                key={coin.symbol}
                coin={coin}
                price={coinPrices[coin.symbol]}
                priceChange={coinPriceChanges[coin.symbol]}
                showValues={showValues}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardWithProviders = (props: NewDashboardProps) => {
  return (
    <PriceCoinsProvider>
      <PriceChangeProvider>
        <NewDashboard {...props} />
      </PriceChangeProvider>
    </PriceCoinsProvider>
  );
}

export default DashboardWithProviders;

export const getServerSideProps: GetServerSideProps<NewDashboardProps> = async (context) => {
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
