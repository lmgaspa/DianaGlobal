'use client';

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Select from "react-select";
import { useRouter } from "next/router";
import SidebarActions from "../../components/OtherComponents/SidebarActions";
import { fetchBalances } from "@/utils/get_balances/getBalances";
import btc from "../../../public/assets/images/btc.png";
import sol from "../../../public/assets/images/sol.png";
import doge from "../../../public/assets/images/doge.png";
import diana from "../../../public/assets/images/diana.png";

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

const Withdraw: React.FC = () => {
  const { status } = useSession();
  const router = useRouter();
  const { userId, name, btcAddress, solAddress, dogeAddress, dianaAddress } = router.query;

  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [withdrawBalance, setWithdrawBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [address, setAddress] = useState("");
  const [selectedCoin, setSelectedCoin] = useState<NetworkKeys | "">("");

  const btcAddressStr = (btcAddress as string) ?? "";
  const solAddressStr = (solAddress as string) ?? "";
  const dogeAddressStr = (dogeAddress as string) ?? "";
  const dianaAddressStr = (dianaAddress as string) ?? "";

  useEffect(() => {
    const getBalance = async (coin: NetworkKeys) => {
      setLoading(true);
      try {
        const balances = await fetchBalances(
          btcAddressStr,
          solAddressStr,
          dogeAddressStr,
          dianaAddressStr
        );
        switch (coin) {
          case "BTC":
            setWithdrawBalance(balances.BTC);
            break;
          case "SOL":
            setWithdrawBalance(balances.SOL);
            break;
          case "DOGE":
            setWithdrawBalance(balances.DOGE);
            break;
          case "DIANA":
            setWithdrawBalance(balances.DIANA);
            break;
          default:
            setWithdrawBalance(null);
        }
      } catch (error) {
        console.error(`Error fetching balance for ${coin}:`, error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedCoin) {
      getBalance(selectedCoin);
    }
  }, [selectedCoin, btcAddressStr, solAddressStr, dogeAddressStr, dianaAddressStr]);

  const handleMaxClick = () => {
    if (withdrawBalance !== null) {
      setWithdrawAmount(withdrawBalance.toString());
    }
  };

  const handleCoinSelect = (selectedOption: { value: string } | null) => {
    if (selectedOption) {
      setSelectedCoin(selectedOption.value as NetworkKeys);
      setAddress("");
    }
  };

  if (status === "loading") {
    return <div className="h-screen flex items-center justify-center text-white">Loading...</div>;
  }

  const coinOptions = coins.map((coin) => ({
    value: coin.symbol,
    label: (
      <div className="flex items-center">
        <Image src={coin.image.src} alt={coin.symbol.toLowerCase()} width={30} height={30} />
        <span className="ml-2">{coin.label}</span>
      </div>
    ),
  }));

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

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-start w-full min-h-screen pt-6 p-6">
        <div className="w-full sm:w-full sm:border sm:rounded-3xl md:w-5/6 lg:w-2/4 max-h-[700px] bg-blue-300 text-black dark:bg-black dark:text-white py-6 px-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Select Coin</h3>
            <Select
              value={coinOptions.find((option) => option.value === selectedCoin)}
              onChange={handleCoinSelect}
              options={coinOptions}
              classNamePrefix="react-select"
              styles={{
                control: (base: Record<string, unknown>) => ({
                  ...base,
                  backgroundColor: "rgba(255, 255, 255, 1)",
                  borderColor: "rgba(107, 114, 128, 1)",
                  width: "100%",
                }),
                menu: (base: Record<string, unknown>) => ({
                  ...base,
                  backgroundColor: "rgba(255, 255, 255, 1)",
                  borderColor: "rgba(107, 114, 128, 1)",
                  color: "black",
                  width: "100%",
                }),
                singleValue: (base: Record<string, unknown>) => ({
                  ...base,
                  color: "black",
                }),
                input: (base: Record<string, unknown>) => ({
                  ...base,
                  color: "black",
                }),
                placeholder: (base: Record<string, unknown>) => ({
                  ...base,
                  color: "black",
                }),
              }}
              className="text-black dark:text-white w-full"
            />
          </div>

          {selectedCoin && (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Withdraw to</h3>
                <input
                  type="text"
                  className="mt-1 p-2 block w-full border dark:text-black text-black border-gray-300 rounded-full"
                  placeholder="Enter address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium dark:text-black text-black">
                  Withdraw Amount
                </label>
                <div className="relative flex items-center">
                  <input
                    className="mt-1 p-2 block w-full border dark:text-black border-gray-300 rounded-full pr-24"
                    placeholder="Minimal is 0.000001"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    required
                  />
                  <button
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-black font-bold rounded-full flex items-center"
                    onClick={handleMaxClick}
                  >
                    <span className="mr-2">{selectedCoin}</span>
                    MAX
                  </button>
                </div>

                <div className="flex justify-between mt-4">
                  <p className="mb-4">Available Withdraw</p>
                  <p className="mb-4">
                    {loading ? "Loading..." : `${withdrawBalance} ${selectedCoin}`}
                  </p>
                </div>

                <p className="mb-4">Minimal amount for withdraw is 0.000001</p>
                <p className="mb-4">Fee for withdraw is 0.000001</p>

                <div className="flex justify-center">
                  <button
                    type="submit"
                    className="bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded w-full"
                    disabled={loading}
                  >
                    Submit Withdraw
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Withdraw;
