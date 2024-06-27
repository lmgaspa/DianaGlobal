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
    setShowSolOptions(true);
    setShowBtcOptions(false);
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
          Deposit BTC
        </button>
        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleWithdrawClick}
        >
          Withdraw SOL
        </button>
      </div>

      {showBtcOptions && (
        <div className="mt-4">
          <p>Choose Bitcoin address:</p>
          <div className="flex space-x-4 mt-2">
            <div className="flex items-center cursor-pointer" onClick={() => handleOptionClick(btcAddress || '', 'btc')}>
              <Image
                src="/assets/images/btc.png"
                alt="Bitcoin"
                width={30}
                height={30}
                className="mr-2"
              />
              <span>Bitcoin</span>
            </div>
          </div>
        </div>
      )}

      {showSolOptions && (
        <div className="mt-4">
          <p>Choose Solana address:</p>
          <div className="flex space-x-4 mt-2">
            <div className="flex items-center cursor-pointer" onClick={() => handleOptionClick(solAddress || '', 'sol')}>
              <Image
                src="/assets/images/sol.png"
                alt="Solana"
                width={30}
                height={30}
                className="mr-2"
              />
              <span>Solana</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ButtonsDepWith;
