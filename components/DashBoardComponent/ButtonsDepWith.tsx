import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

interface ButtonsDepWithProps {
  btcAddress: string | null;
  solAddress: string | null;
}

const ButtonsDepWith: React.FC<ButtonsDepWithProps> = ({ btcAddress, solAddress }) => {
  const router = useRouter();
  const [showBtcOptions, setShowBtcOptions] = useState(false);
  const [showSolOptions, setShowSolOptions] = useState(false);

  const handleDepositClick = () => {
    setShowBtcOptions(true);
    setShowSolOptions(false);
  };

  const handleWithdrawClick = () => {
    setShowBtcOptions(true);
    setShowSolOptions(false);
  };

  const handleOptionClick = (address: string, type: string) => {
    if (address) {
      const path = type === 'sol' ? '/protected/deposit' : '/protected/withdraw';
      router.push({
        pathname: path,
        query: { address }
      });
    }
  };

  return (
    <div className="mt-8">
      <div className="flex">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4"
          onClick={handleDepositClick}
        >
          Deposit
        </button>
        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleWithdrawClick}
        >
          Withdraw
        </button>
      </div>
    </div>
  );
};

export default ButtonsDepWith;