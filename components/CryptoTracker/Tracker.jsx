import React, { useContext } from 'react';
import { PriceCoinsContext } from './PriceCoins';
import { PriceChangeContext } from './PriceChange';
import Image from 'next/image';
import btc from '../../public/assets/images/btc.png';
import eth from '../../public/assets/images/eth.png';
import bnb from '../../public/assets/images/bnb.png';
import sol from '../../public/assets/images/sol.png';

const coinData = [
  { name: 'BITCOIN', symbol: 'BTC', image: btc },
  { name: 'ETHEREUM', symbol: 'ETH', image: eth },
  { name: 'BNB', symbol: 'BNB', image: bnb },
  { name: 'SOLANA', symbol: 'SOL', image: sol }
];

const CoinCard = ({ coin, price, priceChange }) => {
  const getPriceChangeColor = (priceChange) => {
    return { color: priceChange >= 0 ? 'green' : 'red' };
  };

  return (
    <div className="border-b border-gray-300 mb-4 grid grid-cols-3 items-center">
      <div className="flex items-center">
        <Image
          src={coin.image}
          alt={coin.symbol.toLowerCase()}
          width={30}
          height={30}
          objectFit="contain"
        />
        <div className="flex flex-row ml-1">
          <h1 className="text-sm font-bold">{coin.name}</h1>
          <h1 className="text-sm text-gray-500 ml-1">{coin.symbol}</h1>
        </div>
      </div>
      <h1 className="text-sm font-bold ml-12" style={getPriceChangeColor(priceChange)}>
        ${price}
      </h1>
      <h1 className="text-sm font-bold ml-12" style={getPriceChangeColor(priceChange)}>
        {priceChange > 0 ? '+' : ''}
        {(priceChange * 1).toFixed(2)}%
      </h1>
    </div>
  );
};

export default function Tracker() {
  const CoinsPriceProvider = useContext(PriceCoinsContext);
  const PriceChangeProvider = useContext(PriceChangeContext);

  const coinPrices = {
    BTC: CoinsPriceProvider.btcPrice,
    ETH: CoinsPriceProvider.ethPrice,
    BNB: CoinsPriceProvider.bnbPrice,
    SOL: CoinsPriceProvider.solPrice
  };

  const coinPriceChanges = {
    BTC: PriceChangeProvider.btcPriceChange,
    ETH: PriceChangeProvider.ethPriceChange,
    BNB: PriceChangeProvider.bnbPriceChange,
    SOL: PriceChangeProvider.solPriceChange
  };

  return (
    <div className="border shadow-lg h-auto md:h-96 rounded-lg">
      <div className="px-6 py-8">
        <h1 className="text-2sm text-center font-bold">POPULAR IN MARKET</h1>
      </div>
      <div className="flex">
        <div className="container mx-auto ">
          <div className="grid grid-cols-1 justify-center">
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
      <div className='mb-6'>
        <a href="https://coinmarketcap.com/">
          <h1 className="text-center mt-4 font-bold">Discover more...</h1>
        </a>
      </div>
    </div>
  );
};
