import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const WithdrawCrypto: React.FC = () => {
  const router = useRouter();
  const [withdrawAddress, setWithdrawAddress] = useState<string>('');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');

  useEffect(() => {
    const storedAddress = localStorage.getItem('address');
    if (storedAddress) {
      console.log('Stored address:', storedAddress);
    } else {
      console.error('No address found in localStorage');
    }
  }, []);

  const handleDepositClick = () => {
    router.push('/protected/deposit');
  };

  const handleWithdrawClick = () => {
    router.push('/procted/withdraw');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseFloat(withdrawAmount) < 0.000001) {
      alert('Minimal amount for withdraw is 0.000001');
      return;
    }
    console.log('Withdraw Address:', withdrawAddress);
    console.log('Withdraw Amount:', withdrawAmount);
    // Adicione aqui a lógica para processar a retirada
  };

  return (
    <div className="flex h-screen">
      <div className="w-3/10 p-4 border-r border-gray-300">
        <div>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded mr-4 w-full max-w-xs mb-2"
            onClick={handleDepositClick}
          >
            Deposit Crypto
          </button>
        </div>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded mr-4 w-full max-w-xs"
          onClick={handleWithdrawClick}
        >
          Withdraw
        </button>
      </div>
      <div className="w-7/10 p-4">
        <h2 className="text-lg font-semibold mb-4">Withdraw Bitcoin</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Withdraw Address</label>
            <input
              type="text"
              value={withdrawAddress}
              onChange={(e) => setWithdrawAddress(e.target.value)}
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Withdraw Amount</label>
            <input
              type="number"
              step="0.0001"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              required
            />
          </div>
          <p className="mb-4">Minimal amount for withdraw is 0.000001</p>
          <p className="mb-4">Fee for withdraw is 0.000001</p>
          <button
            type="submit"
            className="bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded"
          >
            Submit Withdraw
          </button>
        </form>
      </div>
    </div>
  );
};

export default WithdrawCrypto;
