'use client';

import React from 'react';
import { IoEye, IoEyeOff } from 'react-icons/io5';
import { useRouter } from 'next/router';

interface EstimatedBalanceProps {
  showValues: boolean;
  setShowValues: React.Dispatch<React.SetStateAction<boolean>>;
  storedUserId: string | null;
  storedName: string | null;
  btcAddress: string | null;
  solAddress: string | null;
  dogeAddress: string | null;
  dianaAddress: string | null;
}

const EstimatedBalance: React.FC<EstimatedBalanceProps> = ({
  showValues,
  setShowValues,
  storedUserId,
  storedName,
  btcAddress,
  solAddress,
  dogeAddress,
  dianaAddress,
}) => {
  const router = useRouter();

  const handleDeposit = () => {
    router.push({
      pathname: '/protected/deposit',
      query: { userId: storedUserId, name: storedName, btcAddress, solAddress, dogeAddress, dianaAddress },
    });
  };

  const handleWithdraw = () => {
    router.push({
      pathname: '/protected/withdraw',
      query: { userId: storedUserId, name: storedName, btcAddress, solAddress, dogeAddress, dianaAddress },
    });
  };

  const handleBuyWithMoney = () => {
    router.push({
      pathname: '/protected/buywithmoney',
      query: { userId: storedUserId, name: storedName },
    });
  };

  const handleSwap = () => {
    router.push({
      pathname: '/protected/swap',
      query: { userId: storedUserId, name: storedName },
    });
  };

  const areAddressesLoaded = btcAddress && solAddress && dogeAddress && dianaAddress;

  return (
    <div className="w-full sm:w-2/3 p-4">
      <main className="flex flex-col sm:border sm:rounded-3xl pt-11 p-11 text-black dark:bg-black dark:text-white">
        <div className="flex items-center w-full justify-between mb-4">
          <div className="flex items-center">
            <h2 className="text-xl font-bold">Estimated Balance</h2>
            {showValues ? (
              <IoEye
                className="ml-1 mt-1 cursor-pointer"
                size={22}
                onClick={() => setShowValues(!showValues)}
              />
            ) : (
              <IoEyeOff
                className="ml-1 mt-1 cursor-pointer"
                size={22}
                onClick={() => setShowValues(!showValues)}
              />
            )}
          </div>
        </div>
        <div className="flex flex-col items-start w-full mb-4">
          <p>{showValues ? '0.00000000 BTC' : '*****'}</p>
          <p>{showValues ? '$ 0,00' : '*****'}</p>
        </div>
        {areAddressesLoaded ? (
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:justify-center">
            <button className="bg-blue-500 text-white px-4 py-2 rounded-md" onClick={handleDeposit}>
              Deposit
            </button>
            <button className="bg-red-500 text-white px-4 py-2 rounded-md" onClick={handleWithdraw}>
              Withdraw
            </button>
            <button className="bg-green-500 text-white px-4 py-2 rounded-md" onClick={handleBuyWithMoney}>
              Buy with Money
            </button>
            <button className="bg-yellow-500 text-white px-4 py-2 rounded-md" onClick={handleSwap}>
              Swap
            </button>
          </div>
        ) : (
          <div className="text-gray-500">We are generating the addresses. Once they are generated, deposit and withdrawal options will be available. Please be patient.</div>
        )}
      </main>
    </div>
  );
};

export default EstimatedBalance;
