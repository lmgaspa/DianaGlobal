"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from 'next-auth/react';

interface BalanceBitcoreProps {
  btcAddress: string | null;
  solAddress: string | null;
  dogeAddress: string | null;
}

const BalanceBitcore: React.FC<BalanceBitcoreProps> = ({ btcAddress, solAddress, dogeAddress }) => {
  const [balance, setBalance] = useState<number | null>(null);
  const { data: session, status } = useSession();

  useEffect(() => {
    const fetchBalance = async () => {
      if (btcAddress && session) {
        try {
          const response = await axios.get(`https://api.bitcore.io/api/BTC/mainnet/address/${btcAddress}/balance`);
          const fetchedBalance = response.data.balance;
          const balanceInBTC = parseFloat(fetchedBalance) / 1e8;
          if (!isNaN(balanceInBTC)) {
            setBalance(balanceInBTC);
          } else {
            setBalance(null);
          }
        } catch (error) {
          console.error('Error fetching balance:', error);
          setBalance(null);
        }
      }
    };

    fetchBalance();
  }, [btcAddress, session]);

  useEffect(() => {
    const fetchBalance = async () => {
      if (solAddress && session) {
        try {
          const response = await axios.get(`https://api.mainnet-beta.solana.com/address${solAddress}/balance`);
          const fetchedBalance = response.data.balance;
          const balanceInSOL = parseFloat(fetchedBalance) / 1e8;
          if (!isNaN(balanceInSOL)) {
            setBalance(balanceInSOL);
          } else {
            setBalance(null);
          }
        } catch (error) {
          console.error('Error fetching balance:', error);
          setBalance(null);
        }
      }
    };

    fetchBalance();
  }, [solAddress, session]);

  useEffect(() => {
    const fetchBalance = async () => {
      if (dogeAddress && session) {
        try {
          // Substitua pela URL correta da API que retorna o saldo do Dogecoin
          const response = await axios.get(`https://chain.so/api/v2/get_address_balance/DOGE/${dogeAddress}`);
          const fetchedBalance = response.data.data.confirmed_balance;
          const balanceInDOGE = parseFloat(fetchedBalance)
          if (!isNaN(balanceInDOGE)) {
            setBalance(balanceInDOGE);
          } else {
            setBalance(null);
          }
        } catch (error) {
          console.error('Error fetching balance:', error);
          setBalance(null);
        }
      }
    };
  
    fetchBalance();
  }, [dogeAddress, session]);
  


  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h2 className="text-1xl font-bold mb-4">Estimated Balance</h2>
      <h1 className="text-sm font-bold mb-2">BTC Address: {btcAddress ? btcAddress : 'Loading...'}</h1>
      {balance !== null ? <p className="mb-2">Balance: {balance.toFixed(8)} BTC</p> : <p>Loading balance...</p>}
      <h1 className="text-sm font-bold mb-2">Solana Address: {solAddress ? solAddress : 'Loading...'}</h1>
      {balance !== null ? <p className="mb-2">Balance: {balance.toFixed(8)} SOLANA</p> : <p>Loading balance...</p>}
      <h1 className="text-sm font-bold mb-2">DogeCoin Address: {dogeAddress ? dogeAddress : 'Loading...'}</h1>
      {balance !== null ? <p className="mb-2">Balance: {balance.toFixed(8)} DOGECOIN</p> : <p>Loading balance...</p>}
    </div>
  );
};

export default BalanceBitcore;