import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

interface ButtonsDepWithProps {
  btcAddress: string | null;
  solAddress: string | null;
}

const ButtonsDepWith: React.FC<ButtonsDepWithProps> = ({ btcAddress, solAddress }) => {
  const router = useRouter();
  const [showOptions, setShowOptions] = useState(false);
  const [selectedAddressType, setSelectedAddressType] = useState<string | null>(null);

  const handleButtonClick = (addressType: string) => {
    setShowOptions(true);
    setSelectedAddressType(addressType);
  };

  const handleOptionClick = (address: string) => {
    setShowOptions(false);
    if (address) {
      const path = selectedAddressType === 'sol' ? '/protected/deposit' : '/protected/withdraw';
      router.push({
        pathname: path,
        query: { address }
      });
    }
  };

  return (
    <div className="mt-8">
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4"
        onClick={() => handleButtonClick('btc')}
      >
        Deposit Bitcoin
      </button>
      <button
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => handleButtonClick('sol')}
      >
        Withdraw Solana
      </button>

      {showOptions && (
        <div className="mt-4">
          <p>Choose address type:</p>
          <div className="flex space-x-4 mt-2">
            <div className="flex items-center cursor-pointer" onClick={() => handleOptionClick(btcAddress || '')}>
              <Image
                src="/assets/images/btc.png"
                alt="Bitcoin"
                width={30}
                height={30}
                className="mr-2"
              />
              <span>Bitcoin</span>
            </div>
            <div className="flex items-center cursor-pointer" onClick={() => handleOptionClick(solAddress || '')}>
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
