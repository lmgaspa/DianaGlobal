import React from 'react';
import Image from 'next/image';
import Tracker from '../CryptoTracker/Tracker'

const Popular: React.FC = () => {
  return (
    <div className="dark:bg-slate-400 dark:text-gray-100">
      <div className="flex flex-col md:flex-row md:pt-8 md:p-11">
        {/* Esquerda */}
        <div className="md:w-2/5 p-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 md:mb-4">
            Bitcoin and cryptocurrencies are on the rise! Don&apos;t miss the opportunity, follow the new market trends!
          </h1>
        </div>
        {/* Direita */}
        <div className="md:w-3/5  flex items-center justify-center">
          <Tracker />
        </div>
        <div className='mb-4'></div>
      </div>
    </div>
  );
}

export default Popular