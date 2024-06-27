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
  const [solAddress, setSolAddress] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    const fetchAddresses = async () => {
      try {
        console.log('Fetching addresses...');
        const btcResponse = await axios.post('https://nodejsbtc.onrender.com/create_btc_address', {
          userId: userId,
        });
        const solResponse = await axios.post('https://solana-wallet-generator.onrender.com/create_sol_address/', {
          userId: userId,
        });

        const { btcAddress } = btcResponse.data;
        const { solAddress } = solResponse.data;

        if (btcAddress) {
          setBtcAddress(btcAddress);
          localStorage.setItem(`btcAddress_${userId}`, btcAddress);
        } else {
          console.error('Endereço BTC não foi retornado.');
        }

        if (solAddress) {
          setSolAddress(solAddress);
          localStorage.setItem(`solAddress_${userId}`, solAddress);
        } else {
          console.error('Endereço Solana não foi retornado.');
        }
      } catch (error) {
        console.error('Erro ao buscar endereços:', error);
      }
    };

    const startFetching = () => {
      // Limite de 3 tentativas
      if (retryCount < 3) {
        fetchAddresses();
        setRetryCount(retryCount + 1);
      } else {
        clearInterval(interval as NodeJS.Timeout);
        console.log('Tentativas de busca excedidas.');
      }
    };

    if (session?.user?.id) {
      // Iniciar primeiro fetch
      startFetching();
      // Executar a cada 30 segundos
      interval = setInterval(startFetching, 30000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };

  }, [session, userId, retryCount]);

  const handleSelectCurrency = (currency: string) => {
    console.log(`Currency selected: ${currency}`);
    // Implemente a lógica de seleção de moeda aqui, se necessário
  };

  return (
    <div>
      <BalanceBitcore btcAddress={btcAddress} solAddress={solAddress} />
      <ButtonsDepWith btcAddress={btcAddress} solAddress={solAddress} onSelectCurrency={handleSelectCurrency} />
    </div>
  );
};

export default EstimatedBalance;
