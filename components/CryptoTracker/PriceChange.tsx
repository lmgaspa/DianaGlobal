import React, { createContext, useState, useEffect, ReactNode } from 'react';

interface PriceChangeContextProps {
  btcPriceChange: number;
  ethPriceChange: number;
  bnbPriceChange: number;
  dogePriceChange: number;
  solPriceChange: number;
  dianaPriceChange: number;
}

const PriceChangeContext = createContext<PriceChangeContextProps | undefined>(undefined);

const PriceChangeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [btcPriceChange, setBtcPriceChange] = useState<number>(0);
  const [ethPriceChange, setEthPriceChange] = useState<number>(0);
  const [bnbPriceChange, setBnbPriceChange] = useState<number>(0);
  const [dogePriceChange, setDogePriceChange] = useState<number>(0);
  const [solPriceChange, setSolPriceChange] = useState<number>(0);
  const [dianaPriceChange, setDianaPriceChange] = useState<number>(0);

  useEffect(() => {
    const symbols = ["BTC", "ETH", "BNB", "SOL", "DOGE"];
    const fetchData = async () => {
      const responses = await Promise.all(
        symbols.map((symbol) =>
          fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}USDT`).then(
            (response) => response.json()
          )
        )
      );

      setBtcPriceChange(parseFloat(responses[0].priceChangePercent));
      setEthPriceChange(parseFloat(responses[1].priceChangePercent));
      setBnbPriceChange(parseFloat(responses[2].priceChangePercent));
      setSolPriceChange(parseFloat(responses[3].priceChangePercent));
      setDogePriceChange(parseFloat(responses[4].priceChangePercent));
    };
    fetchData();
  }, []);

  return (
    <PriceChangeContext.Provider value={{
      btcPriceChange,
      ethPriceChange,
      bnbPriceChange,
      dogePriceChange,
      solPriceChange,
      dianaPriceChange,
    }}>
      {children}
    </PriceChangeContext.Provider>
  );
};

export { PriceChangeContext, PriceChangeProvider };
export type { PriceChangeContextProps };