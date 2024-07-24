import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_KEY = '4E585FA4177D772AD403404758A84B5D';
const BTC_ADDRESS = '34xp4vRoCGJym3xR7yCVPFHoCNxv4Twseo';

// Atualize a função para aceitar parâmetros e tipo de retorno
const getBalance = async (coinAddress: string): Promise<string> => {
  try {
    const response = await axios.get(`https://www.okx.com/api/v5/asset/balances`, {
      headers: {
        'OK-ACCESS-KEY': API_KEY,
      },
      params: {
        addr: coinAddress,
      },
    });
    if (response.data.data.length === 0) {
      throw new Error('No balance data found');
    }
    const balance = response.data.data[0].details.find((detail: any) => detail.ccy === 'BTC').availBal;
    return balance.toString(); // Certifique-se de que o saldo seja retornado como string
  } catch (error) {
    console.error('Error fetching balance:', error);
    throw error;
  }
};

const BalanceComponent: React.FC = () => {
  const [withdrawBalance, setWithdrawBalance] = useState<number | null>(null);
  const coinAddress: string = BTC_ADDRESS;

  const fetchBalance = async (coinAddress: string) => {
    if (coinAddress) {
      try {
        const balance = await getBalance(coinAddress);
        setWithdrawBalance(parseFloat(balance));
        console.log(`Balance: ${parseFloat(balance)}`); // Adiciona o console.log aqui
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    }
  };

  // Chame a função com valores de exemplo quando o componente for montado
  useEffect(() => {
    fetchBalance(coinAddress);
  }, [coinAddress]);

  return (
    <div>
      {withdrawBalance !== null ? (
        <p>Balance: {withdrawBalance}</p>
      ) : (
        <p>Loading balance...</p>
      )}
    </div>
  );
};

export default BalanceComponent;
