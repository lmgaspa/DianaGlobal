'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface SidebarActionsProps {
  userId: string;
  name: string;
  btcAddress: string;
  solAddress: string;
  dogeAddress: string;
  dianaAddress: string;
}

const SidebarActions: React.FC<SidebarActionsProps> = ({
  userId,
  name,
  btcAddress,
  solAddress,
  dogeAddress,
  dianaAddress,
}) => {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === '/protected/dashboard') {
    return null;
  }

  const query = {
    userId,
    name,
    btcAddress,
    solAddress,
    dogeAddress,
    dianaAddress,
  };

  return (
    <div className="w-full md:w-1/4 pt-2 md:pt-4 pb-4 px-2 md:px-4 border-b md:border-b-0 md:border-r border-gray-300 bg-white dark:bg-black flex flex-col items-center">
      <div className="flex flex-col gap-4 w-full max-w-xs mt-2">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white py-3 px-6 rounded"
          onClick={() => router.push('/protected/dashboard')}
        >
          Back to Dashboard
        </button>

        <button
          className="bg-blue-500 hover:bg-blue-700 text-white py-3 px-6 rounded"
          onClick={() => router.push(`/protected/deposit?${new URLSearchParams(query).toString()}`)}
        >
          Deposit Crypto
        </button>

        <button
          className="bg-blue-500 hover:bg-blue-700 text-white py-3 px-6 rounded"
          onClick={() => router.push(`/protected/withdraw?${new URLSearchParams(query).toString()}`)}
        >
          Withdraw
        </button>

        <button
          className="bg-blue-500 hover:bg-blue-700 text-white py-3 px-6 rounded"
          onClick={() => router.push(`/protected/buywithmoney?${new URLSearchParams(query).toString()}`)}
        >
          Buy With Money
        </button>

        <button
          className="bg-blue-500 hover:bg-blue-700 text-white py-3 px-6 rounded"
          onClick={() => router.push(`/protected/swap?${new URLSearchParams(query).toString()}`)}
        >
          Swap
        </button>
      </div>
    </div>
  );
};

export default SidebarActions;
