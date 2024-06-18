import React, { useState, useEffect } from "react";
import axios from "axios";
import BalanceBitcore from "./BalanceBitcore";
import ButtonsDepWith from "./ButtonsDepWith";

const EstimatedBalance: React.FC = () => {
  const [btcaddress, setBtcaddress] = useState<string | null>(null);
  return (
    <div>
      <BalanceBitcore btcaddress={btcaddress} />
      <ButtonsDepWith />
    </div>
  );
};

export default EstimatedBalance;

/*

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { useSession } from 'next-auth/react';
import BalanceBitcore from '@/components/DashBoardComponent/BalanceBitcore'; // Certifique-se que o caminho está correto
import ButtonsDepWith from '@/components/DashBoardComponent/ButtonsDepWith'; // Certifique-se que o caminho está correto

const EstimatedBalance: React.FC = () => {
  const [btcaddress, setBtcaddress] = useState<string | null>(null);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    const fetchAddress = async () => {
      if (session?.user && !btcaddress) {
        try {
          console.log("Enviando requisição para o backend local");
          console.log("ID do usuário:", session.user.id);
          const localResponse = await axios.post('https://nodejsbtcex.onrender.com/wallet', {
            userId: session.user.id
          }, {
            headers: { 'Content-Type': 'application/json' }
          });

          const localData = localResponse.data;
          console.log("Resposta do backend local:", localData);
          setBtcaddress(localData.btcaddress);

          console.log("Enviando requisição para o serviço externo");
          const externalResponse = await axios.post('https://btcwallet-new.onrender.com/wallet/', {
            userId: session.user.id
          }, {
            headers: { 'Content-Type': 'application/json' }
          });

          const externalData = externalResponse.data;
          console.log("Resposta do serviço externo:", externalData);
          // Aqui você decide o que fazer com a resposta do serviço externo
        } catch (error) {
          console.error('Erro ao buscar endereço:', error);
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