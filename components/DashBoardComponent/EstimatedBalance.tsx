"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import BalanceBitcore from './BalanceBitcore';
import ButtonsDepWith from './ButtonsDepWith';

interface EstimatedBalanceProps {
  userId: string;
  email: string;
}

const EstimatedBalance: React.FC<EstimatedBalanceProps> = ({ userId }) => {
  const { data: session } = useSession();
  const [btcAddress, setBtcAddress] = useState<string | null>(null);
  const [solAddress, setSolAddress] = useState<string | null>(null);
  const onSelectCurrency = (currency: string) => {
  }
  
  // Carregar do localStorage ao montar o componente
  useEffect(() => {
    const loadFromLocalStorage = () => {
      if (typeof window !== 'undefined') {
        const storedBtcAddress = localStorage.getItem(`btcAddress_${userId}`);
        const storedSolAddress = localStorage.getItem(`solAddress_${userId}`);
        if (storedBtcAddress) {
          setBtcAddress(storedBtcAddress);
        }
        if (storedSolAddress) {
          setSolAddress(storedSolAddress);
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
        const response = await axios.post('https://nodejsbtc.onrender.com/create_btc_address', {
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
        const response = await axios.post('https://solana-wallet-generator.onrender.com/api/create_sol_wallet', {
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
    

    if (session?.user?.id) {
      fetchBtcAddress(session.user.id as string);
      fetchSolAddress(session.user.id as string);
    }
  }, [session]); // Dependência: session

  return (
    <div>
      <BalanceBitcore btcAddress={btcAddress} solAddress={solAddress} />
      <ButtonsDepWith btcAddress={btcAddress} solAddress={solAddress} onSelectCurrency={onSelectCurrency} />
    </div>
  );
};

export default EstimatedBalance;
