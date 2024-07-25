'use client';

import React, { useContext, useState, useEffect } from 'react';
import { PriceCoinsContext, PriceCoinsProvider } from '@/components/CryptoTracker/PriceCoins';
import { PriceChangeContext, PriceChangeProvider } from '@/components/CryptoTracker/PriceChange';
import Image from 'next/image';
import { fetchBalances } from '@/utils/get_balances/GetBalances'; // Importar a função correta
import btc from '../../../public/assets/images/btc.png';
import doge from '../../../public/assets/images/doge.png';
import sol from '../../../public/assets/images/sol.png';
import diana from '../../../public/assets/images/diana.png';

type StaticImageData = {
  src: string;
  height: number;
  width: number;
  placeholder?: string;
};

interface Coin {
  name: string;
  symbol: 'BTC' | 'SOL' | 'DOGE' | 'DIANA';
  image: StaticImageData;
}

const coinData: Coin[] = [
  { name: 'BITCOIN', symbol: 'BTC', image: btc },
  { name: 'SOLANA', symbol: 'SOL', image: sol },
  { name: 'DOGECOIN', symbol: 'DOGE', image: doge },
  { name: 'DIANA', symbol: 'DIANA', image: diana },
];

interface CoinCardProps {
  coin: Coin;
  price: string;
  priceChange: string;
  balance: number | null;
  address: string;
  showValues: boolean;
}

const CoinCard: React.FC<CoinCardProps> = ({ coin, price, priceChange, balance, address, showValues }) => {
  const getPriceChangeColor = (priceChange: number) => {
    return { color: priceChange >= 0 ? 'green' : 'red' };
  };

  return (
    <div className="sm:border-gray-300 sm:mb-4 grid grid-cols-2 sm:grid-cols-4 items-center sm:rounded-md relative group">
      <div className="flex items-center cursor-pointer">
        <div className="relative">
          <Image
            src={coin.image}
            alt={coin.symbol.toLowerCase()}
            width={30}
            height={30}
            style={{ objectFit: 'contain' }}
          />
          {address && (
            <div className="absolute bottom-full mb-2 px-2 py-1 bg-blue-200 text-black text-xs rounded hidden group-hover:block">
              {address}
            </div>
          )}
        </div>
        <div className="flex flex-row ml-2 items-center justify-center">
          <h1 className="text-sm font-bold">{coin.name}</h1>
          <h1 className="hidden text-sm ml-2 text-gray-500 lg:block">{coin.symbol}</h1>
        </div>
      </div>
      <div className="text-right flex flex-col items-end justify-center">
        <p>Amount</p>
        <p>{showValues ? (balance !== null ? balance : 'Loading...') : '*****'}</p>
      </div>
      <div className="hidden sm:block text-center">
        <p>Coin Price</p>
        <h1 className="text-sm font-bold" style={getPriceChangeColor(parseFloat(priceChange))}>
          ${price}
        </h1>
      </div>
      <div className="hidden sm:block text-center">
        <p>24H Change</p>
        <h1 className="text-sm font-bold" style={getPriceChangeColor(parseFloat(priceChange))}>
          {parseFloat(priceChange) > 0 ? '+' : ''}
          {priceChange}%
        </h1>
      </div>
    </div>
  );
};

interface YourPortfolioProps {
  showValues: boolean;
  btcAddress: string;
  solAddress: string;
  dogeAddress: string;
  dianaAddress: string;
}

const YourPortfolio: React.FC<YourPortfolioProps> = ({ showValues, btcAddress, solAddress, dogeAddress, dianaAddress }) => {
  const coinsPriceContext = useContext(PriceCoinsContext);
  const priceChangeContext = useContext(PriceChangeContext);

  const [btcBalance, setBtcBalance] = useState<number | null>(null);
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [dogeBalance, setDogeBalance] = useState<number | null>(null);
  const [dianaBalance, setDianaBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAllBalances = async () => {
      try {
        setLoading(true);
        const balances = await fetchBalances(btcAddress, solAddress, dogeAddress, dianaAddress);
        setBtcBalance(balances.BTC);
        setSolBalance(balances.SOL);
        setDogeBalance(balances.DOGE);
        setDianaBalance(balances.DIANA);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching balances:', error);
        setLoading(false);
      }
    };

    fetchAllBalances();
  }, [btcAddress, solAddress, dogeAddress, dianaAddress]);

  if (!coinsPriceContext || !priceChangeContext || loading) {
    return <div>Loading get balance of coins...</div>;
  }

  const coinPrices = {
    BTC: coinsPriceContext.btcPrice.toString(),
    SOL: coinsPriceContext.solPrice.toString(),
    DOGE: coinsPriceContext.dogePrice.toString(),
    DIANA: coinsPriceContext.dianaPrice.toString(),
  };

  const coinPriceChanges = {
    BTC: priceChangeContext.btcPriceChange.toString(),
    SOL: priceChangeContext.solPriceChange.toString(),
    DOGE: priceChangeContext.dogePriceChange.toString(),
    DIANA: priceChangeContext.dianaPriceChange.toString(),
  };

  const coinBalances = {
    BTC: btcBalance,
    SOL: solBalance,
    DOGE: dogeBalance,
    DIANA: dianaBalance,
  };

  const addresses = {
    BTC: btcAddress,
    SOL: solAddress,
    DOGE: dogeAddress,
    DIANA: dianaAddress,
  };

  return (
    <div className="w-full sm:w-2/3 p-4">
      <div className="p-6 sm:border sm:border-gray-300 sm:rounded-3xl">
        <h2 className="text-xl font-bold mb-4">Your Portfolio</h2>
        <div className="grid grid-cols-1 gap-4">
          {coinData.map((coin) => (
            <CoinCard
              key={coin.symbol}
              coin={coin}
              price={coinPrices[coin.symbol]}
              priceChange={coinPriceChanges[coin.symbol]}
              balance={coinBalances[coin.symbol]}
              address={addresses[coin.symbol]}
              showValues={showValues}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const YourPortfolioProviders: React.FC<{ showValues: boolean; btcAddress: string; solAddress: string; dogeAddress: string; dianaAddress: string; }> = ({ showValues, btcAddress, solAddress, dogeAddress, dianaAddress }) => {
  return (
    <PriceCoinsProvider>
      <PriceChangeProvider>
        <YourPortfolio showValues={showValues} btcAddress={btcAddress} solAddress={solAddress} dogeAddress={dogeAddress} dianaAddress={dianaAddress} />
      </PriceChangeProvider>
    </PriceCoinsProvider>
  );
};

export default YourPortfolioProviders;
