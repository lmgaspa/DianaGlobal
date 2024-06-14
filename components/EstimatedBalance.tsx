import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { useSession } from 'next-auth/react';

const EstimatedBalance: React.FC = () => {
  const [balance, setBalance] = useState<number | null>(null);
  const [btcaddress, setBtcaddress] = useState<string | null>(null); // Initialize as null
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    const fetchAddress = async () => {
      if (session?.user && !btcaddress) {
        try {
          const response = await fetch('https://btcwallet-new.onrender.com/wallet/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: session.user.id }),
          });
  
          const data = await response.json();
          setBtcaddress(data.btcaddress);
        } catch (error) {
          console.error('Error fetching address:', error);
          setBtcaddress(''); // Handle error state
        }
      }
    };
  
    fetchAddress();
  }, [session, btcaddress]);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        if (btcaddress) {
          const response = await axios.get(`https://api.bitcore.io/api/BTC/mainnet/address/${btcaddress}/balance`);
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

    fetchBalance();
  }, [btcaddress]); // Dependency on btcaddress

  const handleDepositClick = () => {
    if (btcaddress) {
      router.push({
        pathname: '/protected/deposit',
        query: { address: btcaddress }
      });
    }
  };

  const handleWithdrawClick = () => {
    if (btcaddress) {
      router.push({
        pathname: '/protected/withdraw',
        query: { address: btcaddress }
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h2 className="text-1xl font-bold mb-4">Estimated Balance</h2>
      {session && session.user && <h1 className="text-1xl font-bold mb-2">User ID: {session.user.id}</h1>}
      <h1 className="text-1xl font-bold mb-2">BTC Address {btcaddress ? btcaddress : 'Loading...'}:</h1>
      
      {balance !== null ? <p className="mb-2">Balance: {balance.toFixed(8)} BTC</p> : <p>Loading balance...</p>}
      <div className="mt-8">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4"
          onClick={handleDepositClick}
        >
          Deposit
        </button>
        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleWithdrawClick}
        >
          Withdraw
        </button>
      </div>
    </div>
  );
}

export default EstimatedBalance;
