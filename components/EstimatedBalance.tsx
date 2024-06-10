import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { useSession } from 'next-auth/react';
import '../app/globals.css';

const EstimatedBalance: React.FC = () => {
  const [balance, setBalance] = useState<number | null>(null);
  const [address, setAddress] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { data: session } = useSession();
  const router = useRouter();

  const fetchAddress = async () => {
    try {
      if (session && session.user) {
        const userId = session.user.id;
        const response = await axios.get(`http://127.0.0.1:8000/btcwalletcreate/?userId=${userId}`);
        setAddress(response.data.address);
        setErrorMessage(null);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response && error.response.status === 409) {
          setAddress(error.response.data.address);
          setErrorMessage(error.response.data.message);
        } else {
          console.error('Error fetching address:', error);
        }
      } else {
        console.error('Unexpected error:', error);
      }
    }
  };

  useEffect(() => {
    if (session && session.user) {
      fetchAddress();
    }
  }, [session]); // Este efeito agora depende da sessão

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        if (address) {
          const response = await axios.get(`https://api.bitcore.io/api/BTC/mainnet/address/${address}/balance`);
          const fetchedBalance = response.data.balance;
          const balanceInBTC = parseFloat(fetchedBalance) / 1e8;
          if (!isNaN(balanceInBTC)) {
            setBalance(balanceInBTC);
          } else {
            setBalance(null);
          }
        }
      } catch (error) {
        console.error('Error fetching balance:', error);
        setBalance(null);
      }
    };

    if (address) {
      fetchBalance();
    }
  }, [address]); // Este efeito ainda depende apenas do endereço

  const handleDepositClick = () => {
    router.push('/protected/deposit');
  };

  const handleWithdrawClick = () => {
    router.push('/protected/withdraw');
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h2 className="text-1xl font-bold mb-4">Estimated Balance</h2>
      {session && session.user && <h1 className="text-1xl font-bold mb-2">User ID: {session.user.id}</h1>}
      <h1 className="text-1xl font-bold mb-2">BTC Address: {address}</h1>
      {errorMessage && <p className="mb-2 text-red-500">{errorMessage}</p>}
      {balance !== null ? <p className="mb-2">Balance: {balance.toFixed(8)} BTC</p> : <p>Loading balance...</p>}
      <div className="mt-8">
        <div>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
            onClick={handleDepositClick}
          >
            Deposit
          </button>
          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 ml-4 rounded"
            onClick={handleWithdrawClick}
          >
            Withdraw
          </button>
        </div>
      </div>
    </div>
  );
}

export default EstimatedBalance;
