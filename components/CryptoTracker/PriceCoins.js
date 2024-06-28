import React, { createContext, useState, useEffect } from 'react';

export const PriceCoinsContext = createContext({});

export default function PriceCoinsProvider({ children }) {
  const [btcPrice, setBtcPrice] = useState(0);
  const [btcPreviousPrice, setBtcPreviousPrice] = useState(0);
  const [ethPrice, setEthPrice] = useState(0);
  const [ethPreviousPrice, setEthPreviousPrice] = useState(0);
  const [bnbPrice, setBnbPrice] = useState(0);
  const [bnbPreviousPrice, setBnbPreviousPrice] = useState(0);
  const [solPrice, setSolPrice] = useState(0);
  const [solPrevious, setSolPreviousPrice] = useState(0);

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
  });

  return (
    <PriceCoinsContext.Provider
      value={{
        btcPrice,
        ethPrice,
        bnbPrice,
        solPrice
      }}
    >
      {children}
    </PriceCoinsContext.Provider>
  );
}