// deposit.tsx

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import QRCode from 'qrcode.react';

interface DepositCryptoProps {
  btcAddress: string | null;
  solAddress: string | null;
  selectedCurrency: string;
  currencyName: string;
}

const DepositCrypto: React.FC<DepositCryptoProps> = ({
  btcAddress,
  solAddress,
  selectedCurrency,
  currencyName,
}) => {
  const router = useRouter();
  const [address, setAddress] = useState<string>('');

  useEffect(() => {
    const { address: queryAddress } = router.query;
    if (typeof queryAddress === 'string') {
      setAddress(queryAddress);
    } else {
      // Determine qual endereço usar com base na moeda selecionada
      if (selectedCurrency === 'BTC') {
        setAddress(btcAddress || '');
      } else if (selectedCurrency === 'SOL') {
        setAddress(solAddress || '');
      }
    }
  }, [router.query, selectedCurrency, btcAddress, solAddress]);

  const handleBackToDashboard = () => {
    router.push('/protected/dashboard');
  };

  const handleDepositCrypto = () => {
    router.push({
      pathname: '/protected/deposit',
      query: { address },
    });
  };

  const handleWithdraw = () => {
    router.push({
      pathname: '/protected/withdraw',
      query: { address },
    });
  };

  return (
    <div className="flex h-screen">
      <div className="w-3/10 p-4 border-r border-gray-300">
        <div>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded mr-4 w-full max-w-xs mb-2"
            onClick={handleBackToDashboard}
          >
            Back to Dashboard
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded mr-4 w-full max-w-xs mb-2"
            onClick={handleDepositCrypto}
          >
            Deposit Crypto
          </button>
        </div>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded mr-4 w-full max-w-xs"
          onClick={handleWithdraw}
        >
          Withdraw
        </button>
      </div>
      <div className="w-7/10 p-4">
        <h2 className="text-lg font-semibold mb-4">Deposit {currencyName}</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Network</label>
          <p className="mt-1 text-sm text-gray-500">{currencyName}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Deposit Address</label>
          <p className="mt-1 text-sm text-gray-500">
            {address ? `${currencyName} Address: ${address}` : 'Loading address...'}
          </p>
        </div>
        {address && (
          <div className="mt-4">
            <QRCode value={address} size={128} />
          </div>
        )}
      </div>
    </div>
  );
};

export default DepositCrypto;
