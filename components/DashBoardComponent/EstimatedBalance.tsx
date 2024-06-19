import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import BalanceBitcore from './BalanceBitcore';
import ButtonsDepWith from './ButtonsDepWith';

const EstimatedBalance: React.FC = () => {
  const [btcaddress, setBtcaddress] = useState<string | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchBtcAddress = async (userId: string) => {
      try {
        console.log('Fetching user data for userId:', userId);

        const response = await axios.post('https://nodejsbtc.onrender.com/createbtcwallet', {
          userId: userId,
        });

        const { btcAddress } = response.data;

        if (btcAddress) {
          setBtcaddress(btcAddress);
        } else {
          console.error('Endereço BTC não foi retornado.');
        }
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
      }
    };

    if (session?.user && !btcaddress) {
      fetchBtcAddress(session.user.id as string);
    }
  }, [session, btcaddress]);

  return (
    <div>
      <BalanceBitcore btcaddress={btcaddress} />
      <ButtonsDepWith btcAddress={btcaddress} />
    </div>
  );
};

export default EstimatedBalance;