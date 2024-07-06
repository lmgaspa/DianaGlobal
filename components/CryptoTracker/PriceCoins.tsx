import React, { createContext, useState, useEffect, ReactNode } from 'react';

interface PriceCoinsContextProps {
  btcPrice: string;
  ethPrice: string;
  bnbPrice: string;
  solPrice: string;
}

export const PriceCoinsContext = createContext<PriceCoinsContextProps | undefined>(undefined);

interface PriceCoinsProviderProps {
  children: ReactNode;
}

const PriceCoinsProvider: React.FC<PriceCoinsProviderProps> = ({ children }) => {
  const [btcPrice, setBtcPrice] = useState<string>('0');
  const [btcPreviousPrice, setBtcPreviousPrice] = useState<string>('0');
  const [ethPrice, setEthPrice] = useState<string>('0');
  const [ethPreviousPrice, setEthPreviousPrice] = useState<string>('0');
  const [bnbPrice, setBnbPrice] = useState<string>('0');
  const [bnbPreviousPrice, setBnbPreviousPrice] = useState<string>('0');
  const [solPrice, setSolPrice] = useState<string>('0');
  const [solPrevious, setSolPreviousPrice] = useState<string>('0');

  useEffect(() => {
    const intervalId = setInterval(async () => {
      const [btcResponse, ethResponse, bnbResponse, solResponse] = await Promise.all([
        fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT'),
        fetch('https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT'),
        fetch('https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT'),
        fetch('https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT'),
      ]);

      const [btcData, ethData, bnbData, solData] = await Promise.all([
        btcResponse.json(),
        ethResponse.json(),
        bnbResponse.json(),
        solResponse.json(),
      ]);

      const btcNewPrice = parseFloat(btcData.price).toFixed(2);
      const btcPriceString = btcNewPrice.toString();
      const btcFormattedPrice = btcPriceString.length > 6 ? btcPriceString.slice(0, btcPriceString.length - 6) + "," + btcPriceString.slice(btcPriceString.length - 6) : btcPriceString;

      const ethNewPrice = parseFloat(ethData.price).toFixed(2);
      const ethPriceString = ethNewPrice.toString();
      const ethFormattedPrice = ethPriceString.length > 6 ? ethPriceString.slice(0, ethPriceString.length - 6) + "," + ethPriceString.slice(ethPriceString.length - 6) : ethPriceString;

      const bnbNewPrice = parseFloat(bnbData.price).toFixed(2);
      const solNewPrice = parseFloat(solData.price).toFixed(2);

      setBtcPreviousPrice(btcPrice);
      setBtcPrice(btcFormattedPrice);

      setEthPreviousPrice(ethPrice);
      setEthPrice(ethFormattedPrice);

      setBnbPreviousPrice(bnbPrice);
      setBnbPrice(bnbNewPrice);

      setSolPreviousPrice(solPrice);
      setSolPrice(solNewPrice);

    }, 5000);

    return () => clearInterval(intervalId);
  }, [btcPrice, ethPrice, bnbPrice, solPrice]);

  return (
    <PriceCoinsContext.Provider value={{ btcPrice, ethPrice, bnbPrice, solPrice }}>
      {children}
    </PriceCoinsContext.Provider>
  );
};

export { PriceCoinsProvider };
