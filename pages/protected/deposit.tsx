"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import QRCode from 'qrcode.react';

interface ButtonsDepWithProps {
  btcAddress: string | null;
  solanaAddress: string | null;
}

const DepositCrypto: React.FC<ButtonsDepWithProps> = ({ btcAddress, solanaAddress }) => {
  const router = useRouter();
  const [address, setBtcAddress] = useState<string>('');

  useEffect(() => {
    const { address: queryAddress } = router.query;
    if (typeof queryAddress === 'string') {
      setBtcAddress(queryAddress);
    } else if (btcAddress) {
      setBtcAddress(btcAddress);
    }
  }, [router.query, btcAddress]);

  return (
    <div className="flex h-screen">
      <div className="w-3/10 p-4 border-r border-gray-300">
        <div>
        <button
            className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded mr-4 w-full max-w-xs mb-2"
            onClick={() => router.push({
              pathname: '/protected/dashboard',
            })}
          >
            Back to Dashboard
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded mr-4 w-full max-w-xs mb-2"
            onClick={() => router.push({
              pathname: '/protected/deposit',
              query: { address }
            })}
          >
            Deposit Crypto
          </button>
        </div>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded mr-4 w-full max-w-xs"
          onClick={() => router.push({
            pathname: '/protected/withdraw',
            query: { address }
          })}
        >
          Withdraw
        </button>
      </div>
      <div className="w-7/10 p-4">
        <h2 className="text-lg font-semibold mb-4">Deposit Bitcoin</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Network</label>
          <p className="mt-1 text-sm text-gray-500">Bitcoin</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Deposit Address</label>
          <p className="mt-1 text-sm text-gray-500">{address || 'Loading address...'}</p>
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
