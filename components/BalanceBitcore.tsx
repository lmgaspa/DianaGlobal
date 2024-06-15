import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from 'next-auth/react';

interface BalanceBitcoreProps {
  btcaddress: string | null;
}

const BalanceBitcore: React.FC<BalanceBitcoreProps> = ({ btcaddress }) => {
  const [balance, setBalance] = useState<number | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchBalance = async () => {
      if (btcaddress) {
        try {
          const response = await axios.get(`https://api.bitcore.io/api/BTC/mainnet/address/${btcaddress}/balance`);
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
  }, [btcaddress]);

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h2 className="text-1xl font-bold mb-4">Estimated Balance</h2>
      {session && session.user && <h1 className="text-1xl font-bold mb-2">User ID: {session.user.id}</h1>}
      <h1 className="text-1xl font-bold mb-2">BTC Address: {btcaddress ? btcaddress : 'Loading...'}</h1>
      {balance !== null ? <p className="mb-2">Balance: {balance.toFixed(8)} BTC</p> : <p>Loading balance...</p>}
    </div>
  );
};

export default BalanceBitcore;

