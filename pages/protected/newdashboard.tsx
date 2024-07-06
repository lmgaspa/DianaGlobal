import React, { useContext } from 'react';
import { PriceCoinsContext, PriceCoinsProvider } from '../../components/CryptoTracker/PriceCoins';
import { PriceChangeContext, PriceChangeProvider } from '../../components/CryptoTracker/PriceChange';
import Image from 'next/image';
import btc from '../../public/assets/images/btc.png';
import eth from '../../public/assets/images/eth.png';
import bnb from '../../public/assets/images/bnb.png';
import sol from '../../public/assets/images/sol.png';

type StaticImageData = {
  src: string;
  height: number;
  width: number;
  placeholder?: string;
};

interface Coin {
  name: string;
  symbol: 'BTC' | 'ETH' | 'BNB' | 'SOL';
  image: StaticImageData;
}

const coinData: Coin[] = [
  { name: 'BITCOIN', symbol: 'BTC', image: btc },
  { name: 'ETHEREUM', symbol: 'ETH', image: eth },
  { name: 'BNB', symbol: 'BNB', image: bnb },
  { name: 'SOLANA', symbol: 'SOL', image: sol }
];

interface CoinCardProps {
  coin: Coin;
  price: string;
  priceChange: number;
}

const CoinCard: React.FC<CoinCardProps> = ({ coin, price, priceChange }) => {
  const getPriceChangeColor = (priceChange: number) => {
    return { color: priceChange >= 0 ? 'green' : 'red' };
  };

  return (
    <div className="border-gray-300 mb-4 grid grid-cols-4 items-center">
      <div className="flex items-center">
        <Image
          src={coin.image}
          alt={coin.symbol.toLowerCase()}
          width={30}
          height={30}
          objectFit="contain"
        />
        <div className="flex flex-row ml-1">
          <h1 className="text-sm font-bold">{coin.symbol}</h1>
          <h1 className="hidden text-sm text-gray-500 ml-1">{coin.name}</h1>
        </div>
      </div>
      <div className="text-center">
        <p>Amount</p>
        <p>0</p>
      </div>
      <div className="text-center">
        <p>Coin Price</p>
        <h1 className="text-sm font-bold" style={getPriceChangeColor(priceChange)}>
          ${price}
        </h1>
      </div>
      <div className="text-center">
        <p>24H Change</p>
        <h1 className="text-sm font-bold" style={getPriceChangeColor(priceChange)}>
          {priceChange > 0 ? '+' : ''}
          {(priceChange * 1).toFixed(2)}%
        </h1>
      </div>
    </div>
  );
};

const NewDashboard: React.FC = () => {
  const coinsPriceContext = useContext(PriceCoinsContext);
  const priceChangeContext = useContext(PriceChangeContext);

  if (!coinsPriceContext || !priceChangeContext) {
    return <div>Loading...</div>;
  }

  const coinPrices = {
    BTC: coinsPriceContext.btcPrice,
    ETH: coinsPriceContext.ethPrice,
    BNB: coinsPriceContext.bnbPrice,
    SOL: coinsPriceContext.solPrice
  };

  const coinPriceChanges = {
    BTC: priceChangeContext.btcPriceChange,
    ETH: priceChangeContext.ethPriceChange,
    BNB: priceChangeContext.bnbPriceChange,
    SOL: priceChangeContext.solPriceChange
  };

  return (
    <div className="flex flex-col items-center text-center p-4 text-black dark:bg-black dark:text-white">
      <div className="w-full md:w-1/3 p-4">
        <div className="border border-gray-300 p-6">
          <h2 className="text-xl font-bold mb-4">Bloco 1</h2>
          <p>Conteúdo do Bloco 1</p>
        </div>
      </div>
      <div className="w-full md:w-1/3 p-4 text-left">
        <div className="border border-gray-300 p-6">
          <h2 className="text-xl font-bold mb-4">Estimated Balance</h2>
          <p>0.00000000 BTC</p>
          <p>$ 0,00</p>
        </div>
      </div>
      <div className="w-full md:w-1/3 p-4">
        <div className="border border-gray-300 p-6">
          <h2 className="text-xl font-bold mb-4">Your Portfolio</h2>
          <div className="grid grid-cols-1">
            {coinData.map((coin) => (
              <CoinCard
                key={coin.symbol}
                coin={coin}
                price={coinPrices[coin.symbol]}
                priceChange={coinPriceChanges[coin.symbol]}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardWithProviders = () => {
  return (
    <PriceCoinsProvider>
      <PriceChangeProvider>
        <NewDashboard />
      </PriceChangeProvider>
    </PriceCoinsProvider>
  );
}

export default DashboardWithProviders;
