import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from 'next-auth/react';
import BalanceBitcore from '@/components/DashBoardComponent/BalanceBitcore';
import ButtonsDepWith from '@/components/DashBoardComponent/ButtonsDepWith';

const EstimatedBalance: React.FC = () => {
  const [btcaddress, setBtcaddress] = useState<string | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchAddress = async () => {
      if (session?.user && !btcaddress) {
        try {
          const response = await axios.post('https://btcwallet-new.onrender.com/wallet/', {
            userId: session.user.id
          });

          const data = response.data;
          console.log(response.data);
          setBtcaddress(data.btcaddress);

          // Save userId and btcAddress to MongoDB
          saveBtcAddress(session.user.id, data.btcaddress);
        } catch (error) {
          console.error('Error fetching or saving address:', error);
          setBtcaddress(''); // Handle error state
        }
      }
    };

    fetchAddress();
  }, [session, btcaddress]);

  const saveBtcAddress = async (userId: string, btcAddress: string) => {
    try {
      const response = await axios.post('https://nodejsbtc.onrender.com/save-btc-address', {
        userId: userId,
        btcAddress: btcAddress
      });
      console.log('Bitcoin address saved successfully:', response.data);
      // Aqui você pode lidar com a resposta, se necessário
    } catch (error) {
      console.error('Error saving bitcoin address:', error);
      // Aqui você pode lidar com o erro, como exibir uma mensagem de erro para o usuário
    }
  };

  return (
    <div>
      <BalanceBitcore btcaddress={btcaddress} />
      <ButtonsDepWith />
    </div>
  );
};

export default EstimatedBalance;
