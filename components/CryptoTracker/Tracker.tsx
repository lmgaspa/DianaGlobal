import React, { useContext } from 'react';
import { PriceCoinsContext, PriceCoinsProvider } from './PriceCoins';
import { PriceChangeContext, PriceChangeProvider } from './PriceChange';
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
    <div className="border-gray-300 mb-4 grid grid-cols-3 items-center">
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
      <h1 className="text-sm font-bold ml-12 text-center" style={getPriceChangeColor(priceChange)}>
        ${price}
      </h1>
      <h1 className="text-sm font-bold ml-12 text-center" style={getPriceChangeColor(priceChange)}>
        {priceChange > 0 ? '+' : ''}
        {(priceChange * 1).toFixed(2)}%
      </h1>
    </div>
  );
};

const Tracker: React.FC = () => {
  const coinsPriceContext = useContext(PriceCoinsContext);
  const priceChangeContext = useContext(PriceChangeContext);

  if (!coinsPriceContext || !priceChangeContext) {
    return <div>Loading...</div>;
  }

  const coinPrices: Record<'BTC' | 'ETH' | 'BNB' | 'SOL', string> = {
    BTC: coinsPriceContext.btcPrice,
    ETH: coinsPriceContext.ethPrice,
    BNB: coinsPriceContext.bnbPrice,
    SOL: coinsPriceContext.solPrice
  };

  const coinPriceChanges: Record<'BTC' | 'ETH' | 'BNB' | 'SOL', number> = {
    BTC: priceChangeContext.btcPriceChange,
    ETH: priceChangeContext.ethPriceChange,
    BNB: priceChangeContext.bnbPriceChange,
    SOL: priceChangeContext.solPriceChange
  };

  return (
    <div className="border shadow-lg h-auto md:h-96 rounded-lg">
      <div className="px-6 py-8">
        <h1 className="text-2sm text-center font-bold mb-4">POPULAR IN MARKET</h1>
      </div>
      <div className="flex">
        <div className="container mx-auto">
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
      <div className="mb-6">
        <a href="https://coinmarketcap.com/">
          <h1 className="text-center mt-4 font-bold">Discover more...</h1>
        </a>
      </div>
    </div>
  );
};

const TrackerWithProviders: React.FC = () => {
  return (
    <PriceCoinsProvider>
      <PriceChangeProvider>
        <Tracker />
      </PriceChangeProvider>
    </PriceCoinsProvider>
  );
};

export default TrackerWithProviders;
