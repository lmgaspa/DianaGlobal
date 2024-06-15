import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { useSession } from 'next-auth/react';
import BalanceBitcore from '@/components/DashBoardComponent/BalanceBitcore'; // Certifique-se que o caminho está correto
import ButtonsDepWith from '@/components/DashBoardComponent/ButtonsDepWith'; // Certifique-se que o caminho está correto

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

  return (
    <div>
      <BalanceBitcore btcaddress={btcaddress} />
      <ButtonsDepWith />
    </div>
  );
};

export default EstimatedBalance;
