import React from 'react';
import { IoEye } from 'react-icons/io5';
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

  return (
    <div className="w-full md:w-1/3 p-4 text-left">
      <div className="border border-gray-300 p-6 rounded-3xl flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <h2 className="text-xl font-bold">Estimated Balance</h2>
            <IoEye className="ml-1 mt-1 cursor-pointer" onClick={() => setShowValues(!showValues)} />
          </div>
          <div className="flex">
            <button className="bg-blue-500 text-white px-4 py-1 rounded-md mr-2" onClick={handleDeposit}>Deposit</button>
            <button className="bg-red-500 text-white px-4 py-1 rounded-md" onClick={handleWithdraw}>Withdraw</button>
          </div>
        </div>
        <div className="flex flex-col">
          <p>{showValues ? '0.00000000 BTC' : '*****'}</p>
          <p>{showValues ? '$ 0,00' : '*****'}</p>
        </div>
      </div>
    </div>
  );
};

export default EstimatedBalance;
