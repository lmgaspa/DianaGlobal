import React from 'react';
import { useRouter } from 'next/router';

const WithdrawCrypto: React.FC = () => {
    const router = useRouter();


    const handleDepositClick = () => {
        router.push('/Deposit');
      };
    const handleWithdrawClick = () => {
        router.push('/Withdraw');
      };

  return (
    <div className="flex h-screen">
      <div className="w-3/10 p-4 border-r border-gray-300">
        <div>
        <button className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded mr-4 w-full max-w-xs mb-2"
        onClick={handleDepositClick}>
        Deposit Crypto</button>
        </div>
        <button className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded mr-4 w-full max-w-xs"
        onClick={handleWithdrawClick}>Withdraw</button>
      </div>
      <div className="w-7/10 p-4">
        <h2 className="text-lg font-semibold mb-4">Withdraw Bitcoin</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Withdraw to</label>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Withdraw Address</label>
          <p className="mt-1 text-sm text-gray-500">Withdraw Amount</p>
        </div>
      </div>
    </div>
  );
};

export default WithdrawCrypto;
