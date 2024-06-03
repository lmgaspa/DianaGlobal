import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const WithdrawCrypto: React.FC = () => {
  const router = useRouter();
  const [withdrawAddress, setWithdrawAddress] = useState<string>('');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [balance, setBalance] = useState<number>(0); // Initialize to 0
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const storedAddress = localStorage.getItem('address');
        if (storedAddress) {
          setAddress(storedAddress);
        } else {
          const response = await axios.get('https://btcex.onrender.com');
          const fetchedAddress = response.data.address;
          localStorage.setItem('address', fetchedAddress);
          setAddress(fetchedAddress);
        }
      } catch (error) {
        console.error('Error fetching address:', error);
      }
    };

    fetchAddress();
  }, []);
  
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        if (address) {
          const response = await axios.get(`https://api.bitcore.io/api/BTC/mainnet/address/${address}/balance`);
          const fetchedBalance = response.data.balance;
          console.log('Raw balance:', fetchedBalance); // Debug
          const balanceInBTC = parseFloat(fetchedBalance) / 1e8;
          if (!isNaN(balanceInBTC)) {
            setBalance(balanceInBTC);
          } else {
            console.error('Invalid balance:', fetchedBalance);
            setBalance(0);
          }
        }
      } catch (error) {
        console.error('Error fetching balance:', error);
        setBalance(0);
      }
    };

    if (address) {
      fetchBalance();
    }
  }, [address]);

  const handleDepositClick = () => {
    router.push('/protected/deposit');
  };

  const handleWithdrawClick = () => {
    router.push('/protected/withdraw');
  };

  const SendBtc = () => {
    const fee = 0.000001;
    const amountToWithdraw = parseFloat(withdrawAmount);
    
    if (amountToWithdraw < 0.000001) {
      setError('Minimal amount for withdraw is 0.000001 BTC');
      return false;
    }

    if (amountToWithdraw + fee > balance) {
      setError('Insufficient balance to cover withdrawal amount and fee.');
      return false;
    }

    setError('');
    console.log('Withdraw Address:', withdrawAddress);
    console.log('Withdraw Amount:', withdrawAmount);

    // Add logic to process the withdrawal
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (SendBtc()) {
      // Proceed with the withdrawal process
      console.log('Proceed with withdrawal');
    }
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
        
        <p className="mb-4">Your Balance is: {balance.toFixed(8)} BTC</p>
        
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
          <p className="mb-4">Minimal amount for withdraw is 0.000001 BTC</p>
          <p className="mb-4">Fee for withdraw is 0.000001 BTC</p>
          {error && <p className="text-red-500 mb-4">{error}</p>}
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
