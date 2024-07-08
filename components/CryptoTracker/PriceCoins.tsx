import React, { createContext, useState, useEffect, ReactNode } from 'react';

interface PriceCoinsContextProps {
  btcPrice: string;
  ethPrice: string;
  bnbPrice: string;
  dogePrice: string;
  solPrice: string;
  dianaPrice: string;
}

export const PriceCoinsContext = createContext<PriceCoinsContextProps | undefined>(undefined);

interface PriceCoinsProviderProps {
  children: ReactNode;
}

const PriceCoinsProvider: React.FC<PriceCoinsProviderProps> = ({ children }) => {
  const [btcPrice, setBtcPrice] = useState<string>('0');
  const [ethPrice, setEthPrice] = useState<string>('0');
  const [bnbPrice, setBnbPrice] = useState<string>('0');
  const [dogePrice, setdogePrice] = useState<string>('0');
  const [solPrice, setSolPrice] = useState<string>('0');
  const [dianaPrice, setDianaPrice] = useState<string>('0');

  useEffect(() => {
    const fetchData = async () => {
      const [btcResponse, ethResponse, bnbResponse, dogeResponse, solResponse] = await Promise.all([
        fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT'),
        fetch('https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT'),
        fetch('https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT'),
        fetch('https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT'),
        fetch('https://api.binance.com/api/v3/ticker/price?symbol=DOGEUSDT'),
      ]);

      const [btcData, ethData, bnbData, solData, dogeData] = await Promise.all([
        btcResponse.json(),
        ethResponse.json(),
        bnbResponse.json(),
        solResponse.json(),
        dogeResponse.json(),
      ]);

      const formatter = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      setBtcPrice(formatter.format(parseFloat(btcData.price)));
      setEthPrice(formatter.format(parseFloat(ethData.price)));
      setBnbPrice(formatter.format(parseFloat(bnbData.price)));
      setSolPrice(formatter.format(parseFloat(solData.price)));
      setdogePrice(formatter.format(parseFloat(dogeData.price)));
    };

    fetchData();
  }, []);

  return (
    <PriceCoinsContext.Provider value={{ btcPrice, ethPrice, bnbPrice, solPrice, dogePrice, dianaPrice }}>
      {children}
    </PriceCoinsContext.Provider>
  );
};

export { PriceCoinsProvider };
