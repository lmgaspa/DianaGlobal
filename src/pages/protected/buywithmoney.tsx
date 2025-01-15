import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Select from 'react-select';
import { useRouter } from 'next/router';
import { fetchBalances } from '@/utils/get_balances/getBalances';
import btc from '../../../public/assets/images/btc.png';
import sol from '../../../public/assets/images/sol.png';
import doge from '../../../public/assets/images/doge.png';
import diana from '../../../public/assets/images/diana.png';

type StaticImageData = {
  src: string;
  height: number;
  width: number;
  placeholder?: string;
};

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

const BuyWithMoney: React.FC = () => {
  const { status } = useSession();
  const router = useRouter();
  const { userId, name, btcAddress, solAddress, dogeAddress, dianaAddress } = router.query;
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [withdrawBalance, setWithdrawBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const userIdStr = (userId as string) ?? '';
  const nameStr = (name as string) ?? '';
  const btcAddressStr = (btcAddress as string) ?? '';
  const solAddressStr = (solAddress as string) ?? '';
  const dogeAddressStr = (dogeAddress as string) ?? '';
  const dianaAddressStr = (dianaAddress as string) ?? '';
  const [address, setAddress] = useState('');
  const [selectedCoin, setSelectedCoin] = useState<NetworkKeys | ''>('');

  useEffect(() => {
    const getBalance = async (coinAddress: string, coin: NetworkKeys) => {
      setLoading(true);
      try {
        const balances = await fetchBalances(btcAddressStr, solAddressStr, dogeAddressStr, dianaAddressStr);
        switch (coin) {
          case 'BTC':
            setWithdrawBalance(balances.BTC);
            break;
          case 'SOL':
            setWithdrawBalance(balances.SOL);
            break;
          case 'DOGE':
            setWithdrawBalance(balances.DOGE);
            break;
          case 'DIANA':
            setWithdrawBalance(balances.DIANA);
            break;
          default:
            setWithdrawBalance(null);
        }
      } catch (error) {
        console.error(`Error fetching balance for ${coin}:`, error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedCoin) {
      switch (selectedCoin) {
        case 'BTC':
          getBalance(btcAddressStr, 'BTC');
          break;
        case 'SOL':
          getBalance(solAddressStr, 'SOL');
          break;
        case 'DOGE':
          getBalance(dogeAddressStr, 'DOGE');
          break;
        case 'DIANA':
          getBalance(dianaAddressStr, 'DIANA');
          break;
        default:
          setWithdrawBalance(null);
      }
    }
  }, [selectedCoin, btcAddressStr, solAddressStr, dogeAddressStr, dianaAddressStr]);

  const handleMaxClick = () => {
    if (withdrawBalance !== null) {
      setWithdrawAmount(withdrawBalance.toString());
    }
  };

  const handleCoinSelect = (selectedOption: any) => {
    setSelectedCoin(selectedOption.value);
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  const coinOptions = coins.map((coin) => ({
    value: coin.symbol,
    label: (
      <div className="flex items-center">
        <Image src={coin.image.src} alt={coin.symbol.toLowerCase()} width={30} height={30} />
        <span className="ml-2">{coin.label}</span>
      </div>
    ),
  }));

  return (
    <div className="flex flex-col md:flex-row">
      <div className="md:w-2/4 p-4 border-r text-center border-gray-300 bg-white dark:bg-black">
        <div className="space-y-4">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded w-2/3"
            onClick={() => router.push('/protected/dashboard')}
          >
            Back to Dashboard
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded w-2/3"
            onClick={() => router.push({
              pathname: '/protected/deposit',
              query: { userId, name, btcAddress, solAddress, dogeAddress, dianaAddress },
            })}
          >
            Deposit Crypto
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded w-2/3"
            onClick={() => router.push({
              pathname: '/protected/withdraw',
              query: { userId, name, btcAddress, solAddress, dogeAddress, dianaAddress },
            })}
          >
            Withdraw
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white py-2 mt-2 px-4 rounded w-2/3"
            onClick={() => router.push({
              pathname: '/protected/buywithmoney',
              query: { userId, name, btcAddress, solAddress, dogeAddress, dianaAddress },
            })}
          >
            Buy with Money
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded w-2/3"
            onClick={() => router.push({
              pathname: '/protected/swap',
              query: { userId, name, btcAddress, solAddress, dogeAddress, dianaAddress },
            })}
          >
            Swap
          </button>
        </div>
      </div>
      <div className="flex w-full justify-center bg-white dark:bg-black text-white p-6">
        <div className="w-full sm:w-full sm:border sm:rounded-3xl md:w-5/6 lg:w-2/4 bg-blue-300 text-black dark:bg-black dark:text-white py-8 px-4 mb-12">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold mb-4">We Are in Production!</h3>
            <p className="text-lg mb-4">
              Explore our features using the options on the left. Thank you for your support!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyWithMoney;




/*

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { QRCodeCanvas } from 'qrcode.react';

const BuyWithMoney: React.FC = () => {
  const { status } = useSession();
  const router = useRouter();
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [qrValue, setQrValue] = useState<string>('');

  const generateQRCode = () => {
    if (paymentAmount > 0) {
      setQrValue(`Payment of ${paymentAmount} requested.`);
    } else {
      alert('Please enter a valid payment amount!');
    }
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col md:flex-row">
      <div className="md:w-2/4 p-4 border-r text-center border-gray-300 bg-white dark:bg-black">
        <div>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded mb-2 w-2/3"
            onClick={() => router.push('/protected/dashboard')}
          >
            Back to Dashboard
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded mb-2 w-2/3"
            onClick={() => router.push('/protected/deposit')}
          >
            Deposit Crypto
          </button>
        </div>
      </div>
      <div className="flex w-full justify-center min-h-screen h-screen bg-white dark:bg-black text-white p-6">
        <div className="w-full sm:w-full sm:border sm:rounded-3xl md:w-5/6 lg:w-2/4 bg-blue-300 text-black dark:bg-black dark:text-white py-8 px-4 mb-12">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Enter Payment Amount</h3>
            <input
              type="number"
              className="mt-1 p-2 block w-full border dark:text-black text-black border-gray-300 rounded-full"
              placeholder="Enter amount"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(Number(e.target.value))}
              required
            />
          </div>
          <button
            className="bg-green-500 hover:bg-green-700 text-white py-2 px-4 rounded mb-4 w-full"
            onClick={generateQRCode}
          >
            Generate QR Code
          </button>
          {qrValue && (
            <div className="mt-4 text-center">
              <h4 className="mb-2 text-lg">Scan the QR Code to Pay</h4>
              <QRCodeCanvas value={qrValue} size={200} />
              <p className="mt-2 text-sm">{qrValue}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuyWithMoney;

*/
