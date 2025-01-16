"use client";

import React, { useState, useEffect } from "react";
import { useSession, getSession } from "next-auth/react";
import Image from "next/image";
import Select from "react-select";
import { QRCodeCanvas } from "qrcode.react";
import { useRouter } from "next/router";
import btc from "../../../public/assets/images/btc.png";
import sol from "../../../public/assets/images/sol.png";
import doge from "../../../public/assets/images/doge.png";
import diana from "../../../public/assets/images/diana.png";
import AddressWithCopy from "@/utils/pasteAddress";

type StaticImageData = {
  src: string;
  height: number;
  width: number;
  placeholder?: string;
};

interface Coin {
  name: string;
  label: string;
  symbol: "BTC" | "DOGE" | "SOL" | "DIANA";
  image: StaticImageData;
}

const coins: Coin[] = [
  { name: "BITCOIN", label: "Bitcoin", symbol: "BTC", image: btc },
  { name: "SOLANA", label: "Solana", symbol: "SOL", image: sol },
  { name: "DOGECOIN", label: "Dogecoin", symbol: "DOGE", image: doge },
  { name: "DIANACOIN", label: "DianaCoin", symbol: "DIANA", image: diana },
];

type NetworkKeys = "BTC" | "SOL" | "DOGE" | "DIANA";

const networks: Record<NetworkKeys, string[]> = {
  BTC: ["Bitcoin"],
  SOL: ["Solana"],
  DOGE: ["Dogecoin"],
  DIANA: ["Solana"],
};

const Deposit: React.FC = () => {
  const { status } = useSession();
  const router = useRouter();
  const { userId, name, btcAddress, solAddress, dogeAddress, dianaAddress } =
    router.query;

  const btcAddressStr = (btcAddress as string) ?? "";
  const solAddressStr = (solAddress as string) ?? "";
  const dogeAddressStr = (dogeAddress as string) ?? "";
  const dianaAddressStr = (dianaAddress as string) ?? "";

  const [selectedCoin, setSelectedCoin] = useState<NetworkKeys | "">("");
  const [selectedNetwork, setSelectedNetwork] = useState<string | "">("");
  const [showDepositAddress, setShowDepositAddress] = useState(false);

  const handleCoinSelect = (selectedOption: any) => {
    setSelectedCoin(selectedOption.value);
    setSelectedNetwork(""); // Reset network ao trocar a moeda
    setShowDepositAddress(false);
  };

  const handleNetworkSelect = (selectedOption: any) => {
    setSelectedNetwork(selectedOption.value);
    setShowDepositAddress(true); // Exibe o endereço de depósito após escolher o network
  };

  const getAddress = () => {
    switch (selectedCoin) {
      case "BTC":
        return btcAddressStr;
      case "SOL":
        return solAddressStr;
      case "DOGE":
        return dogeAddressStr;
      case "DIANA":
        return dianaAddressStr;
      default:
        return "";
    }
  };

  const coinOptions = coins.map((coin) => ({
    value: coin.symbol,
    label: (
      <div className="flex items-center">
        <Image
          src={coin.image.src}
          alt={coin.symbol.toLowerCase()}
          width={30}
          height={30}
        />
        <span className="ml-2">{coin.label}</span>
      </div>
    ),
  }));

  const networkOptions = selectedCoin
    ? networks[selectedCoin].map((network) => ({
        value: network,
        label: network,
      }))
    : [];

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col md:flex-row">
      {/* Sidebar com os botões */}
      <div className="md:w-2/4 p-4 border-r text-center border-gray-300 bg-white dark:bg-black">
        <div>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded mb-2 w-2/3"
            onClick={() => router.push("/protected/dashboard")}
          >
            Back to Dashboard
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded mb-2 w-2/3"
            onClick={() =>
              router.push({
                pathname: "/protected/deposit",
                query: {
                  userId,
                  name,
                  btcAddress,
                  solAddress,
                  dogeAddress,
                  dianaAddress,
                },
              })
            }
          >
            Deposit Crypto
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded w-2/3"
            onClick={() =>
              router.push({
                pathname: "/protected/withdraw",
                query: {
                  userId,
                  name,
                  btcAddress,
                  solAddress,
                  dogeAddress,
                  dianaAddress,
                },
              })
            }
          >
            Withdraw
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 mt-2 rounded w-2/3"
            onClick={() =>
              router.push({
                pathname: "/protected/buywithmoney",
                query: {
                  userId,
                  name,
                  btcAddress,
                  solAddress,
                  dogeAddress,
                  dianaAddress,
                },
              })
            }
          >
            Buy With Money
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 mt-2 rounded w-2/3"
            onClick={() =>
              router.push({
                pathname: "/protected/swap",
                query: {
                  userId,
                  name,
                  btcAddress,
                  solAddress,
                  dogeAddress,
                  dianaAddress,
                },
              })
            }
          >
            Swap
          </button>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex w-full justify-center min-h-screen h-screen bg-white dark:bg-black text-white py-6 px-6">
        <div className="w-full sm:w-full sm:border sm:rounded-3xl md:w-5/6 lg:w-2/4 max-h-[600px] bg-blue-300 text-black dark:bg-black dark:text-white py-6 px-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Select Coin</h3>
            <Select
              value={coinOptions.find(
                (option) => option.value === selectedCoin
              )}
              onChange={handleCoinSelect}
              options={coinOptions}
              classNamePrefix="react-select"
              className="text-black dark:text-white w-full"
            />
          </div>

          {selectedCoin && (
            <div className="mb-3">
              <h3 className="text-lg font-semibold mb-2">Select Network</h3>
              <Select
                value={
                  networkOptions.find(
                    (option) => option.value === selectedNetwork
                  ) || null
                }
                onChange={handleNetworkSelect}
                options={networkOptions}
                classNamePrefix="react-select"
                className="text-black dark:text-white w-full"
              />
            </div>
          )}

          {showDepositAddress && (
            <div className="mb-4 mt-4">
              <h3 className="text-lg font-semibold mb-2">Deposit Address</h3>
              <div className="flex flex-col items-center w-full">
                <div className="w-40 h-40 bg-gray-700 flex items-center justify-center mb-4">
                  <QRCodeCanvas value={getAddress()} size={160} />
                </div>
                <div className="text-center w-full">
                  <p className="text-lg break-words">Address</p>
                  <p className="text-xs break-words max-w-full overflow-hidden">
                    <AddressWithCopy address={getAddress()} />
                  </p>
                  <p className="text-lg mt-2">Minimum deposit</p>
                  <p className="text-base">More than 0.000006 {selectedCoin}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Deposit;
