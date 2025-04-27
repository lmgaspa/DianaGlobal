'use client';

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import axios from "axios";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { RefreshCcw } from "lucide-react";
import SidebarActions from "../../components/OtherComponents/SidebarActions"; // Sidebar correta!

const currencies = ["BTC", "ETH", "USDT", "SOL", "DOGE", "ADA", "MATIC"];

interface ExchangeRates {
  BRL: number;
  BTC: number;
  DOGE: number;
  SOL: number;
  DNC: number;
}

const coinGeckoIDs: Record<string, string> = {
  BRL: "brl",
  BTC: "bitcoin",
  DOGE: "dogecoin",
  SOL: "solana",
  DNC: "dianacoin",
};

async function getExchangeRates(): Promise<ExchangeRates> {
  try {
    const ids = Object.values(coinGeckoIDs).join(",");
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=brl`;
    const response = await axios.get(url);
    return {
      BRL: 1,
      BTC: response.data.bitcoin?.brl || 0,
      DOGE: response.data.dogecoin?.brl || 0,
      SOL: response.data.solana?.brl || 0,
      DNC: 0.01,
    };
  } catch (error) {
    console.error("Erro ao obter taxas de câmbio:", error);
    throw new Error("Falha ao buscar taxas de câmbio.");
  }
}

const Swap = () => {
  const { status } = useSession();
  const router = useRouter();
  const { userId, name, btcAddress, solAddress, dogeAddress, dianaAddress } = router.query;

  const [fromCurrency, setFromCurrency] = useState<keyof ExchangeRates>("BTC");
  const [toCurrency, setToCurrency] = useState<keyof ExchangeRates>("SOL");
  const [amount, setAmount] = useState<number>(0.0);
  const [convertedAmount, setConvertedAmount] = useState<number>(0.0);

  useEffect(() => {
    async function fetchRates() {
      const rates = await getExchangeRates();
      if (amount > 0) {
        const brlValue = amount * rates[fromCurrency];
        setConvertedAmount(brlValue / rates[toCurrency]);
      }
    }
    fetchRates();
  }, [amount, fromCurrency, toCurrency]);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  if (status === "loading") {
    return <div className="h-screen flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white dark:bg-black text-black dark:text-white">
      {/* Sidebar */}
      <SidebarActions
        userId={(userId as string) || "N/A"}
        name={(name as string) || "Guest"}
        btcAddress={(btcAddress as string) || ""}
        solAddress={(solAddress as string) || ""}
        dogeAddress={(dogeAddress as string) || ""}
        dianaAddress={(dianaAddress as string) || ""}
      />

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col items-center justify-start w-full min-h-screen pt-6 p-6">
        <Card className="w-full sm:w-full sm:border sm:rounded-3xl md:w-5/6 lg:w-2/4 bg-blue-300 text-black dark:bg-black dark:text-white p-6">
          <CardContent className="p-4">
            <h2 className="text-2xl font-bold text-center mb-6">Swap</h2>

            <div className="flex flex-col gap-6">
              <p className="text-sm text-black dark:text-white">Change This Coin</p>
              <div className="flex items-center justify-between bg-blue-100 dark:bg-gray-700 p-3 rounded-lg">
                <Input
                  type="number"
                  className="bg-transparent text-lg dark:text-white w-full focus:outline-none"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                />
                <select
                  className="bg-transparent text-black dark:text-white border-none outline-none text-lg ml-2"
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value as keyof ExchangeRates)}
                >
                  {Object.keys(coinGeckoIDs).map((currency) => (
                    <option key={currency} value={currency} className="text-black">
                      {currency}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleSwap}
                  className="p-3 bg-yellow-400 dark:bg-gray-600 rounded-full hover:bg-yellow-200 dark:hover:bg-gray-500 transition"
                >
                  <RefreshCcw size={24} />
                </button>
              </div>

              <p className="text-sm text-black dark:text-white">For this Coin</p>
              <div className="flex items-center justify-between bg-blue-100 dark:bg-gray-700 p-3 rounded-lg">
                <p className="text-lg text-black dark:text-white">{convertedAmount.toFixed(6)}</p>
                <select
                  className="bg-transparent text-black dark:text-white border-none outline-none text-lg ml-2"
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value as keyof ExchangeRates)}
                >
                  {Object.keys(coinGeckoIDs).map((currency) => (
                    <option key={currency} value={currency} className="text-black">
                      {currency}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-center mt-4">
                <Button className="dark:bg-purple-600 dark:hover:bg-purple-500 w-full max-w-xs py-3 text-lg transition">
                  Swap
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Swap;
