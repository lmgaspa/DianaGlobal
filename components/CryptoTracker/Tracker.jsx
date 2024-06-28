import React, { useContext, useState, useEffect } from 'react';
import { PriceCoinsContext, PriceCoinsProvider } from './PriceCoins';
import { PriceChangeContext, PriceChangeProvider } from './PriceChange';
import Image from 'next/image';
import btc from '../../public/assets/images/btc.png'
import eth from '../../public/assets/images/eth.png'
import bnb from '../../public/assets/images/bnb.png'
import sol from '../../public/assets/images/sol.png'

const coinImages = [btc, eth, bnb, sol];

const coinNames = ['BTC', 'ETH', 'BNB', 'SOL'];

export default function Tracker() {
  const CoinsPriceProvider = useContext(PriceCoinsContext);
  const PriceChangeProvider = useContext(PriceChangeContext);

  const getPriceChangeColor = priceChange => {
    if (priceChange >= 0) {
      return { color: 'green' };
    } else {
      return { color: 'red' };
    }
  };

  return (
    <section className="border w-5/6 rounded">
      <div className="container px-4 py-8">
        <h1 className="text-2sm text-center font-bold">POPULAR IN MARKET</h1>
      </div>
      <div className="flex justify-center">
        <div className="container mx-auto px-4 py-4">
          <table className="w-full">
            <thead>
            </thead>
            <tbody>
              <tr className="border-b border-gray-300">
                <td className="w-2/5 py-4">
                  <div className="flex items-center mb-4">
                    <Image
                      src="/assets/images/btc.png"
                      alt="btc"
                      width={30}  // Defina o width desejado
                      height={30} // Defina o height desejado
                      objectFit="contain"
                    />
                    <div className='flex flex-row ml-1'>
                      <h1 className="text-sm font-bold">BTC</h1>
                      <h1 className="text-sm text-gray-500 ml-1">Bitcoin</h1>
                    </div>
                  </div>
                </td>
                <td className="w-1/5 text-right">
                  <h1 className="text-sm font-bold">${CoinsPriceProvider.btcPrice}</h1>
                </td>
                <td className="w-2/5 text-right">
                  <h1 className="text-sm font-bold" style={getPriceChangeColor(PriceChangeProvider.btcPriceChange)}>
                    {PriceChangeProvider.btcPriceChange > 0 ? '+' : ''}
                    {(PriceChangeProvider.btcPriceChange * 1).toFixed(2)}%
                  </h1>
                </td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="w-2/5 py-4">
                  <div className="flex items-center mb-4">
                    <Image
                      src="/assets/images/eth.png"
                      alt="eth"
                      width={30}  // Defina o width desejado
                      height={30} // Defina o height desejado
                      objectFit="contain"
                    />
                    <div className='flex flex-row ml-1'>
                      <h1 className="text-sm font-bold">ETH</h1>
                      <h1 className="text-sm text-gray-500 ml-1">Ethereum</h1>
                    </div>
                  </div>
                </td>
                <td className="w-1/5 text-right">
                  <h1 className="text-sm font-bold">${CoinsPriceProvider.ethPrice}</h1>
                </td>
                <td className="w-2/5 text-right">
                  <h1 className="text-sm font-bold" style={getPriceChangeColor(PriceChangeProvider.btcPriceChange)}>
                    {PriceChangeProvider.ethPriceChange > 0 ? '+' : ''}
                    {(PriceChangeProvider.ethPriceChange * 1).toFixed(2)}%
                  </h1>
                </td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="w-2/5 py-4">
                  <div className="flex items-center mb-4">
                    <Image
                      src="/assets/images/bnb.png"
                      alt="bnb"
                      width={30}  // Defina o width desejado
                      height={30} // Defina o height desejado
                      objectFit="contain"
                    />
                    <div className='flex flex-row ml-1'>
                      <h1 className="text-sm font-bold">BINANCE COIN</h1>
                      <h1 className="text-sm text-gray-500 ml-1">BNB</h1>
                    </div>
                  </div>
                </td>
                <td className="w-1/5 text-right">
                  <h1 className="text-sm font-bold">${CoinsPriceProvider.bnbPrice}</h1>
                </td>
                <td className="w-2/5 text-right">
                  <h1 className="text-sm font-bold" style={getPriceChangeColor(PriceChangeProvider.btcPriceChange)}>
                    {PriceChangeProvider.bnbPriceChange > 0 ? '+' : ''}
                    {(PriceChangeProvider.bnbPriceChange * 1).toFixed(2)}%
                  </h1>
                </td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="w-2/5 py-4">
                  <div className="flex items-center mb-4">
                    <Image
                      src="/assets/images/sol.png"
                      alt="sol"
                      width={30}  // Defina o width desejado
                      height={30} // Defina o height desejado
                      objectFit="contain"
                    />
                    <div className="flex items-center ml-1">
                      <h1 className="text-sm font-bold">SOLANA</h1>
                      <h1 className="text-sm text-gray-500 ml-1">SOL</h1>
                    </div>
                  </div>
                </td>
                <td className="w-1/5 text-right">
                  <h1 className="text-sm font-bold">${CoinsPriceProvider.solPrice}</h1>
                </td>
                <td className="w-2/5 text-right">
                  <h1 className="text-sm font-bold" style={getPriceChangeColor(PriceChangeProvider.btcPriceChange)}>
                    {PriceChangeProvider.solPriceChange > 0 ? '+' : ''}
                    {(PriceChangeProvider.solPriceChange * 1).toFixed(2)}%
                  </h1>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}