import React, { createContext, useState, useEffect } from "react";

const PriceChangeContext = createContext({
  btcPriceChange: 0,
  ethPriceChange: 0,
  bnbPriceChange: 0,
  solPriceChange: 0,
});

const PriceChangeProvider = ({ children }) => {
  const [btcPriceChange, setBtcPriceChange] = useState(0);
  const [ethPriceChange, setEthPriceChange] = useState(0);
  const [bnbPriceChange, setBnbPriceChange] = useState(0);
  const [solPriceChange, setSolPriceChange] = useState(0);

  useEffect(() => {
    const symbols = ["BTC", "ETH", "BNB", "SOL"];
    const fetchData = async () => {
      const responses = await Promise.all(
        symbols.map((symbol) =>
          fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}USDT`).then(
            (response) => response.json()
          )
        )
      );

      setBtcPriceChange(responses[0].priceChangePercent);
      setEthPriceChange(responses[1].priceChangePercent);
      setBnbPriceChange(responses[2].priceChangePercent);
      setSolPriceChange(responses[3].priceChangePercent);
    };
    fetchData();
  }, []);

  return (
    <PriceChangeContext.Provider
      value={{
        btcPriceChange,
        ethPriceChange,
        bnbPriceChange,
        solPriceChange
      }}
    >
      {children}
    </PriceChangeContext.Provider>
  );
};

export { PriceChangeContext, PriceChangeProvider };