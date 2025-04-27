'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import SidebarActions from "../../components/OtherComponents/SidebarActions";

const BuyWithMoney: React.FC = () => {
  const { status } = useSession();
  const router = useRouter();
  const { userId, name, btcAddress, solAddress, dogeAddress, dianaAddress } = router.query;

  const userIdStr = (userId as string) ?? '';
  const nameStr = (name as string) ?? '';
  const btcAddressStr = (btcAddress as string) ?? '';
  const solAddressStr = (solAddress as string) ?? '';
  const dogeAddressStr = (dogeAddress as string) ?? '';
  const dianaAddressStr = (dianaAddress as string) ?? '';

  if (status === 'loading') {
    return <div className="h-screen flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white dark:bg-black text-black dark:text-white">
      {/* Sidebar */}
      <SidebarActions
        userId={userIdStr}
        name={nameStr}
        btcAddress={btcAddressStr}
        solAddress={solAddressStr}
        dogeAddress={dogeAddressStr}
        dianaAddress={dianaAddressStr}
      />

      {/* Conteúdo principal */}
      <div className="flex flex-1 flex-col items-center justify-start w-full min-h-screen pt-6 p-6">
        <div className="w-full sm:w-full sm:border sm:rounded-3xl md:w-5/6 lg:w-2/4 bg-blue-300 text-black dark:bg-black dark:text-white py-8 px-4 mb-12">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold mb-4">We Are in Production!</h3>
            <p className="text-lg mb-4">
              Explore our features using the options on the left. Thank you for your support!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyWithMoney;
