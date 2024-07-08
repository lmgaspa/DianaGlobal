'use client';

import React, { useContext } from 'react';
import { PriceCoinsContext } from '../../components/CryptoTracker/PriceCoins';
import { PriceChangeContext } from '../../components/CryptoTracker/PriceChange';
import Image from 'next/image';
import btc from '../../public/assets/images/btc.png';
import doge from '../../public/assets/images/doge.png';
import sol from '../../public/assets/images/sol.png';
import diana from '../../public/assets/images/diana.png';

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
  priceChange: number;
  showValues: boolean;
}

const CoinCard: React.FC<CoinCardProps> = ({ coin, price, priceChange, showValues }) => {
  const getPriceChangeColor = (priceChange: number) => {
    return { color: priceChange >= 0 ? 'green' : 'red' };
  };

  return (
    <div className="sm:border-gray-300 sm:mb-4 grid grid-cols-2 sm:grid-cols-4 items-center sm:rounded-md">
      <div className="flex items-center">
        <Image
          src={coin.image}
          alt={coin.symbol.toLowerCase()}
          width={30}
          height={30}
          style={{ objectFit: 'contain' }}
        />
        <div className="flex flex-row ml-2 items-center justify-center">
          <h1 className="text-sm font-bold">{coin.symbol}</h1>
          <h1 className="hidden text-sm ml-2 text-gray-500 lg:block">{coin.name}</h1>
        </div>
      </div>
      <div className="text-right flex flex-col items-end justify-center">
        <p>Amount</p>
        <p>{showValues ? '0' : '*****'}</p>
      </div>
      <div className="hidden sm:block text-center">
        <p>Coin Price</p>
        <h1 className="text-sm font-bold" style={getPriceChangeColor(priceChange)}>
          ${price}
        </h1>
      </div>
      <div className="hidden sm:block text-center">
        <p>24H Change</p>
        <h1 className="text-sm font-bold" style={getPriceChangeColor(priceChange)}>
          {priceChange > 0 ? '+' : ''}
          {(priceChange * 1).toFixed(2)}%
        </h1>
      </div>
    </div>
  );
};

interface YourPortfolioProps {
  showValues: boolean;
}

const YourPortfolio: React.FC<YourPortfolioProps> = ({ showValues }) => {
  const coinsPriceContext = useContext(PriceCoinsContext);
  const priceChangeContext = useContext(PriceChangeContext);

  if (!coinsPriceContext || !priceChangeContext) {
    return <div>Loading...</div>;
  }

  const coinPrices = {
    BTC: coinsPriceContext.btcPrice,
    SOL: coinsPriceContext.solPrice,
    DOGE: coinsPriceContext.dogePrice,
    DIANA: coinsPriceContext.dianaPrice,
  };

  const coinPriceChanges = {
    BTC: priceChangeContext.btcPriceChange,
    SOL: priceChangeContext.solPriceChange,
    DOGE: priceChangeContext.dogePriceChange,
    DIANA: priceChangeContext.dianaPriceChange,
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
              showValues={showValues}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default YourPortfolio;
