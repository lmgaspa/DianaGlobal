import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import BalanceBitcore from './BalanceBitcore';
import ButtonsDepWith from './ButtonsDepWith';

const EstimatedBalance: React.FC = () => {
  const { data: session } = useSession();
  const [btcAddress, setBtcAddress] = useState<string | null>(null);

  useEffect(() => {
    const fetchBtcAddress = async (userId: string) => {
      try {
        console.log('Fetching BTC address for userId:', userId);

        const response = await axios.post('https://nodejsbtc.onrender.com/createbtcwallet', {
          userId: userId,
        });

        const { btcAddress } = response.data;

        if (btcAddress) {
          setBtcAddress(btcAddress);
          // Armazenar btcAddress no localStorage associado ao userId
          localStorage.setItem(`btcAddress_${userId}`, btcAddress);
        } else {
          console.error('Endereço BTC não foi retornado.');
        }
      } catch (error) {
        console.error('Erro ao buscar endereço BTC:', error);
      }
    };

    const loadBtcAddress = () => {
      if (session?.user) {
        const storedBtcAddress = localStorage.getItem(`btcAddress_${session.user.id}`);

        if (storedBtcAddress) {
          setBtcAddress(storedBtcAddress);
        } else {
          fetchBtcAddress(session.user.id as string);
        }
      }
    };

    loadBtcAddress();
  }, [session]);

  return (
    <div>
      <BalanceBitcore btcaddress={btcAddress} />
      <ButtonsDepWith btcAddress={btcAddress} />
    </div>
  );
};

export default EstimatedBalance;
