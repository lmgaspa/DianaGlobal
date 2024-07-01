import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';

interface EstimatedBalanceProps {
  userId: string;
  email: string;
}

const EstimatedBalance: React.FC<EstimatedBalanceProps> = ({ userId, email }) => {
  const { data: session } = useSession();
  const [btcAddress, setBtcAddress] = useState<string | null>(null);
  const [solAddress, setSolAddress] = useState<string | null>(null);
  const [dogeAddress, setDogeAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAddresses = async (userId: string) => {
      try {
        setLoading(true);

        const fetchAddress = async (endpoint: string, setAddress: React.Dispatch<React.SetStateAction<string | null>>) => {
          const response = await axios.post(`https://solana-wallet-generator.onrender.com/api/${endpoint}`, { userId });
          const { address } = response.data;
          if (address) {
            setAddress(address);
            localStorage.setItem(`${endpoint}_${userId}`, address);
          } else {
            console.error(`Endereço ${endpoint.toUpperCase()} não foi retornado.`);
          }
        };

        await Promise.all([
          fetchAddress('create_btc_address', setBtcAddress),
          fetchAddress('create_sol_address', setSolAddress),
          fetchAddress('create_doge_address', setDogeAddress),
        ]);
      } catch (error) {
        console.error('Erro ao buscar endereços:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchAddresses(session.user.id as string);
    }
  }, [session]);

  if (loading) {
    return <div>Carregando...</div>;
  }

  console.log(btcAddress);
  console.log(solAddress);
  console.log(dogeAddress);

  return (
    <div>
    </div>
  );
};

export default EstimatedBalance;