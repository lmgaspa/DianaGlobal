'use client';

import React from 'react';
import { IoEye, IoEyeOff } from 'react-icons/io5';
import { useRouter } from 'next/router';
import { useBackendProfile } from '@/hooks/useBackendProfile';
import { useSession } from 'next-auth/react';

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
  const { profile, error } = useBackendProfile();
  const { status: sessionStatus } = useSession();
  
  // Verificar se usuário precisa definir senha
  // Se houver erro 401 mas sessão válida, pode ser Google user sem senha - bloquear
  // Se não tem profile mas tem sessão válida e erro, assumir que precisa bloquear
  const hasErrorButSession = error && error.includes("Unauthorized") && sessionStatus === "authenticated";
  const isGoogle = (profile?.authProvider ?? "").toUpperCase() === "GOOGLE";
  const hasPassword = Boolean(profile?.passwordSet);
  // Bloquear se: erro com sessão válida OU (é Google E não tem senha)
  const needsPassword = hasErrorButSession || (isGoogle && !hasPassword);

  const handleDeposit = () => {
    if (needsPassword) {
      router.push('/set-password');
      return;
    }
    router.push({
      pathname: '/protected/deposit',
      query: { userId: storedUserId, name: storedName, btcAddress, solAddress, dogeAddress, dianaAddress },
    });
  };

  const handleWithdraw = () => {
    if (needsPassword) {
      router.push('/set-password');
      return;
    }
    router.push({
      pathname: '/protected/withdraw',
      query: { userId: storedUserId, name: storedName, btcAddress, solAddress, dogeAddress, dianaAddress },
    });
  };

  const handleBuyWithMoney = () => {
    if (needsPassword) {
      router.push('/set-password');
      return;
    }
    router.push({
      pathname: '/protected/buywithmoney',
      query: { userId: storedUserId, name: storedName },
    });
  };

  const handleSwap = () => {
    if (needsPassword) {
      router.push('/set-password');
      return;
    }
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
            <button 
              className={`px-4 py-2 rounded-md ${needsPassword ? 'bg-gray-400 cursor-not-allowed opacity-60' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors`}
              onClick={handleDeposit}
              disabled={needsPassword}
              title={needsPassword ? 'Set a password to unlock this feature' : 'Deposit'}
            >
              Deposit
            </button>
            <button 
              className={`px-4 py-2 rounded-md ${needsPassword ? 'bg-gray-400 cursor-not-allowed opacity-60' : 'bg-red-500 hover:bg-red-600'} text-white transition-colors`}
              onClick={handleWithdraw}
              disabled={needsPassword}
              title={needsPassword ? 'Set a password to unlock this feature' : 'Withdraw'}
            >
              Withdraw
            </button>
            <button 
              className={`px-4 py-2 rounded-md ${needsPassword ? 'bg-gray-400 cursor-not-allowed opacity-60' : 'bg-green-500 hover:bg-green-600'} text-white transition-colors`}
              onClick={handleBuyWithMoney}
              disabled={needsPassword}
              title={needsPassword ? 'Set a password to unlock this feature' : 'Buy with Money'}
            >
              Buy with Money
            </button>
            <button 
              className={`px-4 py-2 rounded-md ${needsPassword ? 'bg-gray-400 cursor-not-allowed opacity-60' : 'bg-yellow-500 hover:bg-yellow-600'} text-white transition-colors`}
              onClick={handleSwap}
              disabled={needsPassword}
              title={needsPassword ? 'Set a password to unlock this feature' : 'Swap'}
            >
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
