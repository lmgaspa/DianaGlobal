// EstimatedBalance.tsx
/*
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import ButtonsDepWith from './ButtonsDepWith';
import BalanceBitcore from './BalanceBitcore';

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
  const [dianaAddress, setDianaAddress] = useState<string | null>(null);

  // Carregar do localStorage ao montar o componente
  useEffect(() => {
    const loadFromLocalStorage = () => {
      if (typeof window !== 'undefined') {
        const storedBtcAddress = localStorage.getItem(`btcAddress_${userId}`);
        const storedSolAddress = localStorage.getItem(`solAddress_${userId}`);
        const storedDogeAddress = localStorage.getItem(`dogeAddress_${userId}`);
        const storedDianaAddress = localStorage.getItem(`dianaAddress_${userId}`);
        if (storedBtcAddress) {
          setBtcAddress(storedBtcAddress);
        }
        if (storedSolAddress) {
          setSolAddress(storedSolAddress);
        }
        if (storedDogeAddress) {
          setDogeAddress(storedDogeAddress);
        }if (storedDianaAddress) {
          setDianaAddress(storedDianaAddress);
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
        console.log('Fetching DOGE address for userId:', userId);
        const response = await axios.post('https://solana-wallet-generator.onrender.com/api/create_doge_address', {
          userId: userId,
        });
        const { dogeAddress } = response.data;
        if (dogeAddress) {
          setDogeAddress(dogeAddress);
          // Armazenar dogeAddress no localStorage associado ao userId
          localStorage.setItem(`dogeAddress_${userId}`, dogeAddress);
        } else {
          console.error('Endereço DOGE não foi retornado.');
        }
      } catch (error) {
        console.error('Erro ao buscar endereço DOGE:', error);
      }
    };

    const fetchDianaAddress = async (userId: string) => {
      try {
        console.log('Fetching Diana address for userId:', userId);
        const response = await axios.post('https://solana-wallet-generator.onrender.com/api/create_diana_address', {
          userId: userId,
        });
        const { dianaAddress } = response.data;
        if (dianaAddress) {
          setDianaAddress(dianaAddress);
          // Armazenar dianaAddress no localStorage associado ao userId
          localStorage.setItem(`dianaAddress_${userId}`, dianaAddress);
        } else {
          console.error('Endereço Diana não foi retornado.');
        }
      } catch (error) {
        console.error('Erro ao buscar endereço Diana:', error);
      }
    };

    if (session?.user?.id) {
      fetchBtcAddress(session.user.id as string);
      fetchSolAddress(session.user.id as string);
      fetchDogeAddress(session.user.id as string);
      fetchDianaAddress(session.user.id as string);
    }
  }, [session]); // Dependência: session

  return (
    <div>
      <BalanceBitcore
        btcAddress={btcAddress}
        solAddress={solAddress}
        dogeAddress={dogeAddress}
        dianaAddress={dianaAddress} />
      <ButtonsDepWith
        btcAddress={btcAddress}
        solAddress={solAddress}
        dogeAddress={dogeAddress}
        dianaAddress={dianaAddress}
        onSelectCurrency={(currencyCode, currencyName) => {
          // Implemente a lógica desejada aqui
          console.log(`Selected currency: ${currencyCode} (${currencyName})`);
        }}
      />
    </div>
  );
};

export default EstimatedBalance;

*/