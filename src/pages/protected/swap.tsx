'use client';

import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import axios from "axios";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { RefreshCcw } from "lucide-react";
import SidebarActions from "../../components/OtherComponents/SidebarActions";

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
      DNC: 0.01, // mock para DNC
    };
  } catch (error) {
    console.error("Erro ao obter taxas de câmbio:", error);
    throw new Error("Falha ao buscar taxas de câmbio.");
  }
}

const Swap: React.FC = () => {
  const { status } = useSession();
  const router = useRouter();
  const { userId, name, btcAddress, solAddress, dogeAddress, dianaAddress } = router.query;

  const [fromCurrency, setFromCurrency] = useState<keyof ExchangeRates>("BTC");
  const [toCurrency, setToCurrency] = useState<keyof ExchangeRates>("SOL");

  // manter como STRING para não “puxar” 0 enquanto digita
  const [amountStr, setAmountStr] = useState<string>("0");

  // taxas em state
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [loadingRates, setLoadingRates] = useState<boolean>(false);
  const [ratesError, setRatesError] = useState<string | null>(null);

  const fetchRates = async () => {
    try {
      setLoadingRates(true);
      setRatesError(null);
      const r = await getExchangeRates();
      setRates(r);
    } catch (e: any) {
      setRatesError(e?.message || "Erro ao buscar taxas.");
    } finally {
      setLoadingRates(false);
    }
  };

  // busca ao montar
  useEffect(() => {
    fetchRates();
  }, []);

  // cálculo do convertido
  const convertedAmount = useMemo(() => {
    if (!rates) return 0;
    const amount = parseFloat(amountStr.replace(",", "."));
    if (!isFinite(amount) || amount <= 0) return 0;

    const fromRate = rates[fromCurrency] ?? 0;
    const toRate = rates[toCurrency] ?? 1;

    const brlValue = amount * fromRate;
    const out = brlValue / toRate;
    return isFinite(out) ? out : 0;
  }, [amountStr, fromCurrency, toCurrency, rates]);

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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-center">Swap</h2>
              <Button
                className="flex items-center gap-2 dark:bg-gray-700 dark:hover:bg-gray-600"
                onClick={fetchRates}
                disabled={loadingRates}
                title="Atualizar cotações"
              >
                <RefreshCcw size={18} />
                {loadingRates ? "Atualizando..." : "Atualizar"}
              </Button>
            </div>

            {ratesError && (
              <div className="mb-4 text-sm text-red-500">
                {ratesError}
              </div>
            )}

            <div className="flex flex-col gap-6">
              <p className="text-sm text-black dark:text-white">Change This Coin</p>
              <div className="flex items-center justify-between bg-blue-100 dark:bg-gray-700 p-3 rounded-lg">
                <Input
                  type="text"
                  inputMode="decimal"
                  // step="any" // (não é necessário em text; pode usar se trocar para type=number)
                  className="bg-transparent text-lg dark:text-white w-full focus:outline-none"
                  value={amountStr}
                  onChange={(e) => {
                    const v = e.target.value;
                    // permite vazio, números e ponto/vírgula
                    if (v === "" || /^[0-9]*[.,]?[0-9]*$/.test(v)) {
                      setAmountStr(v);
                    }
                  }}
                  placeholder="0"
                />
                <select
                  className="bg-transparent text-black dark:text-yellow-500 border-none outline-none text-lg ml-2"
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value as keyof ExchangeRates)}
                >
                  {Object.keys(coinGeckoIDs).map((currency) => (
                    <option key={currency} value={currency} className="text-black dark:text-yellow-500">
                      {currency}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleSwap}
                  className="p-3 bg-yellow-400 dark:bg-gray-600 rounded-full hover:bg-yellow-200 dark:hover:bg-gray-500 transition"
                  title="Inverter moedas"
                >
                  <RefreshCcw size={24} />
                </button>
              </div>

              <p className="text-sm text-black dark:text-white">For this Coin</p>
              <div className="flex items-center justify-between bg-blue-100 dark:bg-gray-700 p-3 rounded-lg">
                <p className="text-lg text-black dark:text-white">
                  {convertedAmount ? convertedAmount.toFixed(6) : "—"}
                </p>
                <select
                  className="bg-transparent text-black dark:text-yellow-500 border-none outline-none text-lg ml-2"
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value as keyof ExchangeRates)}
                >
                  {Object.keys(coinGeckoIDs).map((currency) => (
                    <option key={currency} value={currency} className="text-black dark:text-yellow-500">
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

              {/* Info opcional de taxa atual */}
              {rates && (
                <div className="text-xs opacity-70">
                  1 {fromCurrency} ≈ {(rates[fromCurrency] / (rates[toCurrency] || 1)).toFixed(6)} {toCurrency}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Swap;
