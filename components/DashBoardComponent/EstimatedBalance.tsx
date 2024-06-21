import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import BalanceBitcore from './BalanceBitcore';
import ButtonsDepWith from './ButtonsDepWith';

const EstimatedBalance: React.FC = () => {
  const [btcAddress, setBtcAddress] = useState<string | null>(null);
  const { data: session } = useSession();

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
          // Armazenar btcAddress no localStorage
          localStorage.setItem('btcAddress', btcAddress);
        } else {
          console.error('Endereço BTC não foi retornado.');
        }
      } catch (error) {
        console.error('Erro ao buscar endereço BTC:', error);
      }
    };

    // Verificar se há um endereço BTC armazenado localmente
    const storedBtcAddress = localStorage.getItem('btcAddress');
    if (storedBtcAddress) {
      setBtcAddress(storedBtcAddress);
    } else if (session?.user && !btcAddress) {
      fetchBtcAddress(session.user.id as string);
    }
  }, [session, btcAddress]);

  return (
    <div>
      <BalanceBitcore btcaddress={btcAddress} />
      <ButtonsDepWith btcAddress={btcAddress} />
    </div>
  );
};

export default EstimatedBalance;
