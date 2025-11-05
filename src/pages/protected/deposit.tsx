'use client';

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Image from "next/image";
import Select from "react-select";
import { QRCodeCanvas } from "qrcode.react";
import btc from "../../../public/assets/images/btc.png";
import sol from "../../../public/assets/images/sol.png";
import doge from "../../../public/assets/images/doge.png";
import diana from "../../../public/assets/images/diana.png";
import AddressWithCopy from "@/utils/pasteAddress";
import SidebarActions from "../../components/OtherComponents/SidebarActions"; // <- Sidebar correta

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
  const { userId, name, btcAddress, solAddress, dogeAddress, dianaAddress } = router.query;

  const btcAddressStr = (btcAddress as string) ?? "";
  const solAddressStr = (solAddress as string) ?? "";
  const dogeAddressStr = (dogeAddress as string) ?? "";
  const dianaAddressStr = (dianaAddress as string) ?? "";

  const [selectedCoin, setSelectedCoin] = useState<NetworkKeys | "">("");
  const [selectedNetwork, setSelectedNetwork] = useState<string | "">("");
  const [showDepositAddress, setShowDepositAddress] = useState(false);

  const handleCoinSelect = (selectedOption: any) => {
    setSelectedCoin(selectedOption.value);
    setSelectedNetwork("");
    setShowDepositAddress(false);
  };

  const handleNetworkSelect = (selectedOption: any) => {
    setSelectedNetwork(selectedOption.value);
    setShowDepositAddress(true);
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
    <div className="flex flex-col md:flex-row min-h-screen bg-white dark:bg-black text-black dark:text-white">
      {/* Sidebar */}
      <SidebarActions
        userId={(userId as string) || "N/A"}
        name={(name as string) || "Guest"}
        btcAddress={btcAddressStr}
        solAddress={solAddressStr}
        dogeAddress={dogeAddressStr}
        dianaAddress={dianaAddressStr}
      />

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col items-center justify-start w-full min-h-screen pt-6 p-6">
        <div className="w-full sm:w-full sm:border sm:rounded-3xl md:w-5/6 lg:w-2/4 max-h-[700px] bg-blue-300 text-black dark:bg-black dark:text-white py-6 px-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Select Coin</h3>
            <Select
              value={coinOptions.find((option) => option.value === selectedCoin)}
              onChange={handleCoinSelect}
              options={coinOptions}
              classNamePrefix="react-select"
              className="text-black dark:text-black w-full"
            />
          </div>

          {selectedCoin && (
            <div className="mb-3">
              <h3 className="text-lg font-semibold mb-2">Select Network</h3>
              <Select
                value={networkOptions.find((option) => option.value === selectedNetwork) || null}
                onChange={handleNetworkSelect}
                options={networkOptions}
                classNamePrefix="react-select"
                className="text-black dark:text-black w-full"
              />
            </div>
          )}

          {showDepositAddress && (
            <div className="mb-4 mt-4 flex flex-col items-center">
              <h3 className="text-lg font-semibold mb-2">Deposit Address</h3>

              <div className="w-40 h-40 bg-gray-700 flex items-center justify-center mb-4">
                <QRCodeCanvas value={getAddress()} size={160} />
              </div>

              {/* Exibe o endereço completo */}
              <div className="text-center w-full">
                <p className="text-lg break-words mb-2">Address</p>
                <p className="text-sm break-words w-full text-center px-2">
                  <AddressWithCopy address={getAddress()} />
                </p>

                <p className="text-lg mt-4">Minimum deposit</p>
                <p className="text-base">More than 0.000006 {selectedCoin}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Deposit;
