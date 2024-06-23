import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import BalanceBitcore from './BalanceBitcore';
import ButtonsDepWith from './ButtonsDepWith';

interface EstimatedBalanceProps {
  userId: string;
  email: string;
}

const EstimatedBalance: React.FC<EstimatedBalanceProps> = ({ userId, email }) => {
  const { data: session } = useSession();
  const [btcAddress, setBtcAddress] = useState<string | null>(null);

  // Carregar do localStorage ao montar o componente
  useEffect(() => {
    const loadFromLocalStorage = () => {
      if (typeof window !== 'undefined') {
        const storedBtcAddress = localStorage.getItem(`btcAddress_${userId}`);
        if (storedBtcAddress) {
          setBtcAddress(storedBtcAddress);
        }
      }
    };
    loadFromLocalStorage();
  }, [userId]); // Dependência: userId

  // Carregar do servidor quando a sessão mudar
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

    if (session?.user?.id) {
      fetchBtcAddress(session.user.id as string);
    }
  }, [session]); // Dependência: session

  return (
    <div>
      <BalanceBitcore btcaddress={btcAddress} />
      <ButtonsDepWith btcAddress={btcAddress} />
    </div>
  );
};

export default EstimatedBalance;