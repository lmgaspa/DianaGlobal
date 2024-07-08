import React, { createContext, useState, useEffect, ReactNode } from 'react';

interface PriceCoinsContextProps {
  btcPrice: string;
  ethPrice: string;
  bnbPrice: string;
  dogePrice: string;
  solPrice: string;
  dianaPrice: string;
}

const PriceCoinsContext = createContext<PriceCoinsContextProps | undefined>(undefined);

const PriceCoinsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [btcPrice, setBtcPrice] = useState<string>('0');
  const [ethPrice, setEthPrice] = useState<string>('0');
  const [bnbPrice, setBnbPrice] = useState<string>('0');
  const [dogePrice, setDogePrice] = useState<string>('0');
  const [solPrice, setSolPrice] = useState<string>('0');
  const [dianaPrice, setDianaPrice] = useState<string>('0');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [btcResponse, ethResponse, bnbResponse, dogeResponse, solResponse] = await Promise.all([
          fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT'),
          fetch('https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT'),
          fetch('https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT'),
          fetch('https://api.binance.com/api/v3/ticker/price?symbol=DOGEUSDT'),
          fetch('https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT'),
        ]);

        const [btcData, ethData, bnbData, dogeData, solData] = await Promise.all([
          btcResponse.json(),
          ethResponse.json(),
          bnbResponse.json(),
          dogeResponse.json(),
          solResponse.json(),
        ]);

        const formatter = new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });

        setBtcPrice(formatter.format(parseFloat(btcData.price)));
        setEthPrice(formatter.format(parseFloat(ethData.price)));
        setBnbPrice(formatter.format(parseFloat(bnbData.price)));
        setDogePrice(formatter.format(parseFloat(dogeData.price)));
        setSolPrice(formatter.format(parseFloat(solData.price)));
        // Assuming Diana price is set manually or fetched from another source
        setDianaPrice('0.50'); // Example static price
      } catch (error) {
        console.error('Error fetching coin prices:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <PriceCoinsContext.Provider value={{ btcPrice, ethPrice, bnbPrice, dogePrice, solPrice, dianaPrice }}>
      {children}
    </PriceCoinsContext.Provider>
  );
};

export { PriceCoinsContext, PriceCoinsProvider };
export type { PriceCoinsContextProps };
