// EstimatedBalance.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

interface EstimatedBalanceProps {
  userId: string;
  email: string;
}

const EstimatedBalance: React.FC<EstimatedBalanceProps> = ({ userId, email }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [btcAddress, setBtcAddress] = useState<string | null>(null);
  const [solAddress, setSolAddress] = useState<string | null>(null);
  const [dogeAddress, setDogeAddress] = useState<string | null>(null);

  // Carregar do localStorage ao montar o componente
  useEffect(() => {
    const loadFromLocalStorage = () => {
      if (typeof window !== 'undefined') {
        const storedBtcAddress = localStorage.getItem(`btcAddress_${userId}`);
        const storedSolAddress = localStorage.getItem(`solAddress_${userId}`);
        const storedDogeAddress = localStorage.getItem(`dogeAddress_${userId}`);
        if (storedBtcAddress) {
          setBtcAddress(storedBtcAddress);
        }
        if (storedSolAddress) {
          setSolAddress(storedSolAddress);
        }
        if (storedDogeAddress) {
          setDogeAddress(storedDogeAddress);
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
        const response = await axios.post('https://solana-wallet-generator.onrender.com/api/create_btc_address', {
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

    const fetchSolAddress = async (userId: string) => {
      try {
        console.log('Fetching Solana address for userId:', userId);
        const response = await axios.post('https://solana-wallet-generator.onrender.com/api/create_sol_address', {
          userId: userId,
        });
        const { solAddress } = response.data;
        if (solAddress) {
          setSolAddress(solAddress);
          // Armazenar solanaAddress no localStorage associado ao userId
          localStorage.setItem(`solAddress_${userId}`, solAddress);
        } else {
          console.error('Endereço Solana não foi retornado.');
        }
      } catch (error) {
        console.error('Erro ao buscar endereço Solana:', error);
      }
    };

    const fetchDogeAddress = async (userId: string) => {
      try {
        console.log('Fetching DogeCoin address for userId:', userId);
        const response = await axios.post('https://solana-wallet-generator.onrender.com/api/create_doge_address', {
          userId: userId,
        });
        const { dogeAddress } = response.data;
        if (dogeAddress) {
          setDogeAddress(dogeAddress);
          // Armazenar solanaAddress no localStorage associado ao userId
          localStorage.setItem(`dogeAddress_${userId}`, dogeAddress);
        } else {
          console.error('Endereço DogeCoin não foi retornado.');
        }
      } catch (error) {
        console.error('Erro ao buscar endereço DogeCoin:', error);
      }
    };
    
    if (session?.user?.id) {
      fetchBtcAddress(session.user.id as string);
      fetchSolAddress(session.user.id as string);
      fetchDogeAddress(session.user.id as string);
    }
  }, [session]); // Dependência: session

  return (
    <div>
      <h1>{btcAddress} {solAddress} {dogeAddress}</h1>
    </div>
  );
};

export default EstimatedBalance;