import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { useSession } from 'next-auth/react';
import BalanceBitcore from '@/components/BalanceBitcore'; // Certifique-se que o caminho está correto

const EstimatedBalance: React.FC = () => {
  const [btcaddress, setBtcaddress] = useState<string | null>(null);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    const fetchAddress = async () => {
      if (session?.user && !btcaddress) {
        try {
          const response = await axios.post('https://btcwallet-new.onrender.com/wallet/', {
            userId: session.user.id
          }, {
            headers: { 'Content-Type': 'application/json' }
          });

          const data = response.data;
          setBtcaddress(data.btcaddress);
        } catch (error) {
          console.error('Error fetching address:', error);
          setBtcaddress(''); // Handle error state
        }
      }
    };

    fetchAddress();
  }, [session, btcaddress]);

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
    <div>
      <BalanceBitcore btcaddress={btcaddress} />
      <div className="mt-8">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4"
          onClick={handleDepositClick}
          disabled={!btcaddress}
        >
          Deposit
        </button>
        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleWithdrawClick}
          disabled={!btcaddress}
        >
          Withdraw
        </button>
      </div>
    </div>
  );
};

export default EstimatedBalance;
