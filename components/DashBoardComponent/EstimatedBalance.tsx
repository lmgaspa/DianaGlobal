import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import BalanceBitcore from './BalanceBitcore';
import ButtonsDepWith from './ButtonsDepWith';

const EstimatedBalance: React.FC = () => {
  const [btcaddress, setBtcaddress] = useState<string | null>(null);
  const { data: session } = useSession();
  const [userData, setUserData] = useState<any>(null); // Estado para armazenar os dados do usuário

  useEffect(() => {
    const fetchData = async () => {
      if (session?.user) {
        try {
          const userId = session.user.id as string; // Obtém o userId do session.user
          console.log('Fetching user data for userId:', userId);

          // Exemplo de requisição para obter informações do usuário
          const response = await axios.post('https://nodejsbtc.onrender.com/createbtc', {
            userId: userId, // Enviando userId no corpo da requisição
          });
         
          const { btcAddress } = response.data; // Assumindo que o backend retorna o btcAddress

          if (btcAddress) {
            setBtcaddress(btcAddress);
          } else {
            console.error('Endereço BTC não foi retornado.');
          }

        } catch (error) {
          console.error('Erro ao buscar dados do usuário:', error);
        }
      }
    };

    fetchData();
  }, [session, btcaddress]);

  return (
    <div>
      <BalanceBitcore btcaddress={btcaddress}/> {/* Exemplo de componente BalanceBitcore sem propriedades específicas */}
      <ButtonsDepWith />
    </div>
  );
};

export default EstimatedBalance;


/*

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from 'next-auth/react';
import BalanceBitcore from '@/components/DashBoardComponent/BalanceBitcore'; // Certifique-se que o caminho está correto
import ButtonsDepWith from '@/components/DashBoardComponent/ButtonsDepWith'; // Certifique-se que o caminho está correto

const EstimatedBalance: React.FC = () => {
  const [btcaddress, setBtcaddress] = useState<string | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchAddress = async () => {
      if (session?.user && !btcaddress) {
        try {
          const response = await axios.post('https://nodejsbtc.onrender.com/', {
              userId: session.user.id
          });

          const data = response.data;
          console.log(response.data)
          setBtcaddress(data.btcaddress);
        } catch (error) {
          console.error('Error fetching address:', error);
          setBtcaddress(''); // Handle error state
        }
      }
    };

    fetchAddress();
  }, [session, btcaddress]);  

  return (
    <div>
      <BalanceBitcore btcaddress={btcaddress} />
      <ButtonsDepWith />
    </div>
  );
};

export default EstimatedBalance;

*/