import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import axios from 'axios';

import btc from '../../../public/assets/images/btc.png';
import sol from '../../../public/assets/images/sol.png';
import doge from '../../../public/assets/images/doge.png';
import diana from '../../../public/assets/images/diana.png';

type Currency = 'BRL' | 'BTC' | 'DOGE' | 'SOL' | 'DNC';

// Lista de moedas suportadas e seus equivalentes na CoinGecko API
const coinGeckoIDs: Record<Currency, string> = {
  BRL: 'brl',
  BTC: 'bitcoin',
  DOGE: 'dogecoin',
  SOL: 'solana',
  DNC: 'dianacoin', // Se não existir na CoinGecko, precisa definir taxa manual
};

// Função para buscar taxas de câmbio em tempo real
async function getExchangeRates(): Promise<Record<Currency, number>> {
  try {
    const ids = Object.values(coinGeckoIDs).join(',');
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=brl`;
    
    const response = await axios.get(url);
    const data = response.data;
    
    return {
      BRL: 1,
      BTC: data.bitcoin?.brl || 0,
      DOGE: data.dogecoin?.brl || 0,
      SOL: data.solana?.brl || 0,
      DNC: 0.01, // Supondo que 1 DNC = R$ 0,01 (ajustável)
    };
  } catch (error) {
    console.error('Erro ao obter taxas de câmbio:', error);
    throw new Error('Falha ao buscar taxas de câmbio.');
  }
}

// Função para converter valores entre moedas
async function swapCurrency(amount: number, from: Currency, to: Currency): Promise<number> {
  const rates = await getExchangeRates();

  if (!rates[from] || !rates[to]) {
    throw new Error('Moeda não suportada!');
  }

  const brlValue = amount * rates[from]; // Converte para BRL primeiro
  return brlValue / rates[to]; // Converte para a moeda desejada
}

type StaticImageData = {
  src: string;
  height: number;
  width: number;
  placeholder?: string;
};

interface Coin {
  name: string;
  label: string;
  symbol: 'BTC' | 'DOGE' | 'SOL' | 'DNC';
  image: StaticImageData;
}

const coins: Coin[] = [
  { name: 'BITCOIN', label: 'Bitcoin', symbol: 'BTC', image: btc },
  { name: 'SOLANA', label: 'Solana', symbol: 'SOL', image: sol },
  { name: 'DOGECOIN', label: 'Dogecoin', symbol: 'DOGE', image: doge },
  { name: 'DIANACOIN', label: 'DianaCoin', symbol: 'DNC', image: diana },
];

const Swap: React.FC = () => {
  const { status } = useSession();
  const router = useRouter();
  const { userId, name, btcAddress, solAddress, dogeAddress, dianaAddress } = router.query;

  if (status === 'loading') {
    return <div className="h-screen flex items-center justify-center text-gray-600">Loading...</div>;
  }

  return (
    <div className="flex flex-col md:flex-row">
    {/* Sidebar com os botões */}
    <div className="md:w-2/4 p-4 border-r text-center border-gray-300 bg-white dark:bg-black">
      <div>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded mb-2 w-2/3"
          onClick={() => router.push("/protected/dashboard")}
        >
          Back to Dashboard
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded mb-2 w-2/3"
          onClick={() =>
            router.push({
              pathname: "/protected/deposit",
              query: {
                userId,
                name,
                btcAddress,
                solAddress,
                dogeAddress,
                dianaAddress,
              },
            })
          }
        >
          Deposit Crypto
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded w-2/3"
          onClick={() =>
            router.push({
              pathname: "/protected/withdraw",
              query: {
                userId,
                name,
                btcAddress,
                solAddress,
                dogeAddress,
                dianaAddress,
              },
            })
          }
        >
          Withdraw
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 mt-2 rounded w-2/3"
          onClick={() =>
            router.push({
              pathname: "/protected/buywithmoney",
              query: {
                userId,
                name,
                btcAddress,
                solAddress,
                dogeAddress,
                dianaAddress,
              },
            })
          }
        >
          Buy With Money
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 mt-2 rounded w-2/3"
          onClick={() =>
            router.push({
              pathname: "/protected/swap",
              query: {
                userId,
                name,
                btcAddress,
                solAddress,
                dogeAddress,
                dianaAddress,
              },
            })
          }
        >
          Swap
        </button>
      </div>
    </div>
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-black">
      <div className="md:w-2/4 p-6 border border-gray-300 bg-white dark:bg-black rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800 dark:text-white">
          Crypto Swap
        </h2>
        </div>

        <div className="space-y-4 flex flex-col items-center">
          {/* Botões de navegação */}
          {[
            { label: 'Back to Dashboard', path: '/protected/dashboard' },
            { label: 'Deposit Crypto', path: '/protected/deposit' },
            { label: 'Withdraw', path: '/protected/withdraw' },
            { label: 'Buy with Money', path: '/protected/buywithmoney' },
            { label: 'Swap', path: '/protected/swap' },
          ].map((button, index) => (
            <button
              key={index}
              className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded-lg w-2/3 transition-all duration-200"
              onClick={() =>
                router.push({
                  pathname: button.path,
                  query: { userId, name, btcAddress, solAddress, dogeAddress, dianaAddress },
                })
              }
            >
              {button.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Swap;
