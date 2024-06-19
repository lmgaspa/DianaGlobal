import React from 'react';
import { useRouter } from 'next/router';

interface ButtonsDepWithProps {
  btcAddress: string | null;
}

const ButtonsDepWith: React.FC<ButtonsDepWithProps> = ({ btcAddress }) => {
  const router = useRouter();

  const handleDepositClick = () => {
    if (btcAddress) {
      router.push({
        pathname: '/protected/deposit',
        query: { address: btcAddress }
      });
    }
  };

  const handleWithdrawClick = () => {
    if (btcAddress) {
      router.push({
        pathname: '/protected/withdraw',
        query: { address: btcAddress }
      });
    }
  };

  return (
    <div className="mt-8">
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
  );
};

export default ButtonsDepWith;
