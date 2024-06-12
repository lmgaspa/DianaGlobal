import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { useSession } from 'next-auth/react';
import '../app/globals.css';

  const EstimatedBalance: React.FC = () => {
  const [balance, setBalance] = useState<number | null>(null);
  const [address, setAddress] = useState<string>('');
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        // Check if session and session.user are available
        if (session && session.user) {
          const userId = session.user.id;
          
          // Fetch address from your backend
          const response = await fetch('https://btcwallet-new.onrender.com/wallet/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId }) // Send userId in the body
          });

          // Ensure the response is OK
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }

          const data = await response.json();
          
          // Set the address state with the fetched address
          setAddress(data.address);
        }
      } catch (error) {
        // Log any errors encountered during the fetch
        console.error('Error fetching address:', error);
      }
    };

    // Invoke the fetchAddress function when the component mounts or session changes
    fetchAddress();
  }, [session]); // Dependency array, triggers effect when session changes

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
  }, [address]);

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
      <h1 className="text-1xl font-bold mb-2">BTC Address {address}:</h1>
      
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