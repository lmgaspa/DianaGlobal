"use client";

import React, { useState, useEffect } from 'react';
import { useSession, getSession } from 'next-auth/react';
import Image from 'next/image';
import Select from 'react-select';
import { useRouter } from 'next/router';
import btc from '../../public/assets/images/btc.png';
import sol from '../../public/assets/images/sol.png';
import doge from '../../public/assets/images/doge.png';
import diana from '../../public/assets/images/diana.png';

type StaticImageData = {
  src: string;
  height: number;
  width: number;
  placeholder?: string;
};

interface WithdrawProps {
  label: string;
}

interface Coin {
  name: string;
  label: string;
  symbol: 'BTC' | 'DOGE' | 'SOL' | 'DIANA';
  image: StaticImageData;
}

const coins: Coin[] = [
  { name: 'BITCOIN', label: 'Bitcoin', symbol: 'BTC', image: btc },
  { name: 'SOLANA', label: 'Solana', symbol: 'SOL', image: sol },
  { name: 'DOGECOIN', label: 'Dogecoin', symbol: 'DOGE', image: doge },
  { name: 'DIANACOIN', label: 'DianaCoin', symbol: 'DIANA', image: diana },
];

type NetworkKeys = 'BTC' | 'SOL' | 'DOGE' | 'DIANA';

const networks: Record<NetworkKeys, string[]> = {
  BTC: ['Bitcoin'],
  SOL: ['Solana'],
  DOGE: ['Dogecoin'],
  DIANA: ['Solana'],
};

const Withdraw: React.FC<WithdrawProps> = ({ label }) => {
  const { status } = useSession();
  const router = useRouter();
  const { userId, name, btcAddress, solAddress, dogeAddress, dianaAddress } = router.query;

  const userIdStr = (userId as string) ?? '';
  const nameStr = (name as string) ?? '';
  const btcAddressStr = (btcAddress as string) ?? '';
  const solAddressStr = (solAddress as string) ?? '';
  const dogeAddressStr = (dogeAddress as string) ?? '';
  const dianaAddressStr = (dianaAddress as string) ?? '';

  useEffect(() => {
    console.log('UserId:', userIdStr);
    console.log('Name:', nameStr);
    console.log('BTC Address:', btcAddressStr);
    console.log('SOL Address:', solAddressStr);
    console.log('DOGE Address:', dogeAddressStr);
    console.log('DIANA Address:', dianaAddressStr);
  }, [userIdStr, nameStr, btcAddressStr, solAddressStr, dogeAddressStr, dianaAddressStr]);

  const [selectedCoin, setSelectedCoin] = useState<NetworkKeys | ''>(''); 

  const handleCoinSelect = (selectedOption: any) => {
    setSelectedCoin(selectedOption.value);
  };

   const handleBackToDashboard = () => {
    router.push('/protected/dashboard');
  };

  const handleDepositCrypto = () => {
    router.push({
      pathname: '/protected/deposit',
      query: { userId, name, btcAddress, solAddress, dogeAddress, dianaAddress },
    });
  };

  const handleWithdrawCrypto = () => {
    router.push({
      pathname: '/protected/withdraw',
      query: { userId, name, btcAddress, solAddress, dogeAddress, dianaAddress },
    });
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  const getAddress = () => {
    switch (selectedCoin) {
      case 'BTC':
        return btcAddressStr;
      case 'SOL':
        return solAddressStr;
      case 'DOGE':
        return dogeAddressStr;
      case 'DIANA':
        return dianaAddressStr;
      default:
        return '';
    }
  };

  const coinOptions = coins.map((coin) => ({
    value: coin.symbol,
    label: (
      <div className="flex items-center">
        <Image src={coin.image.src} alt={coin.symbol.toLowerCase()} width={30} height={30} objectFit="contain" />
        <span className="ml-2">{coin.label}</span>
      </div>
    ),
  }));

  return (
    <div className="flex h-screen">
      <div className="w-1/4 p-4 border-r text-center border-gray-300 bg-white dark:bg-black">
        <div>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded mb-2 w-3/4"
            onClick={handleBackToDashboard}
          >
            Back to Dashboard
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded mb-2 w-3/4"
            onClick={handleDepositCrypto}
          >
            Deposit Crypto
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded w-3/4"
            onClick={handleWithdrawCrypto}
          >
            Withdraw
          </button>
        </div>
      </div>
      <div className="w-3/4 flex justify-center items-center bg-white dark:bg-black text-white p-6">
        <div className="w-full max-w-lg border rounded-3xl bg-blue-300 text-black dark:bg-black dark:text-white py-8 px-8 mb-12">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Select Coin</h3>
            <Select
              value={coinOptions.find((option) => option.value === selectedCoin)}
              onChange={handleCoinSelect}
              options={coinOptions}
              classNamePrefix="react-select"
              styles={{
                control: (base: any) => ({
                  ...base,
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                  borderColor: 'rgba(107, 114, 128, 1)',
                  borderRadius: '9999px'
                }),
                menu: (base: any) => ({
                  ...base,
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                  borderColor: 'rgba(107, 114, 128, 1)',
                  color: 'black',
                }),
                singleValue: (base: any) => ({
                  ...base,
                  color: 'black',
                }),
                input: (base: any) => ({
                  ...base,
                  color: 'black',
                }),
                placeholder: (base: any) => ({
                  ...base,
                  color: 'black',
                }),
              }}
              className="text-black dark:text-white"
            />
          </div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Withdraw to</h3>
            <input
              type="text"
              className="mt-1 p-2 block w-full border dark:text-black text-black border-gray-300 rounded-full"
              placeholder="Enter address"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium dark:text-black text-black">Withdraw Amount</label>
            <input
              type="number"
              step="0.0001"
              className="mt-1 p-2 block w-full border dark:text-black border-gray-300 rounded-full"
              required
            />
          </div>
          <p className="mb-4">Minimal amount for withdraw is 0.000001</p>
          <p className="mb-4">Fee for withdraw is 0.000001</p>
          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded"
            >
              Submit Withdraw
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Withdraw;

export const getServerSideProps = async (context: any) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  const { user } = session;
  const { userId, name, btcAddress, solAddress, dogeAddress, dianaAddress } = context.query;

  console.log('Session user:', user);
  console.log('BTC Address:', btcAddress);
  console.log('SOL Address:', solAddress);
  console.log('DOGE Address:', dogeAddress);
  console.log('DIANA Address:', dianaAddress);

  if (!userId || !name || !btcAddress || !solAddress || !dogeAddress || !dianaAddress) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return {
    props: {
      userId: userId ?? '',
      name: name ?? '',
      btcAddress: btcAddress ?? '',
      solAddress: solAddress ?? '',
      dogeAddress: dogeAddress ?? '',
      dianaAddress: dianaAddress ?? '',
    },
  };
};
