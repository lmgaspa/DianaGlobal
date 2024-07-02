import React from 'react';
import Tracker from '../CryptoTracker/Tracker';

const Popular: React.FC = () => {
  return (
    <main className="flex flex-col items-center md:flex-row p-0 pt-4 md:pt-6 md:p-0  text-black dark:bg-black dark:text-white">
      {/* Esquerda */}
      <div className="w-full lg:ml-12 lg:pl-12 lg:w-4/6">
        <h1 className="max-sm:hidden sm:hidden md:block md:text-3xl lg:text-5xl md:w-3/8 md:ml-12 font-bold md:mr-8 lg:mb-12 lg:mr-12">
          Bitcoin and cryptocurrencies are on the rise! Don&apos;t miss the opportunity, follow the new market trends!
        </h1>
      </div>
      {/* Direita */}
      <div className="max-sm:w-10/12 sm:w-11/12 mr-4 ml-4 md:w-6/8 md:mr-8 lg:w-2/6 mt-0 pb-6 lg:mr-12">
        <Tracker />
      </div>
    </main>
  );
}

export default Popular;
