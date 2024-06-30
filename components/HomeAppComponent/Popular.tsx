import React from 'react';
import Image from 'next/image';
import Tracker from '../CryptoTracker/Tracker'

const Popular: React.FC = () => {
  return (
    <div className="dark:bg-slate-500 dark:text-gray-100">
      <main className="flex flex-col md:flex-row items-center justify-between pt-4 md:pt-8 p-4 md:p-11">
        {/* Esquerda */}
        <div className="md:w-1/2 p-6 md:p-8 text-container">
          <h1 className="text-4xl md:text-3xl font-bold mb-2 md:mb-4">Bitcoin e criptomoedas estão em alta! Não perca a oportunidade, acompanhe as novas tendências do mercado!</h1>
        </div>
        {/* Direita */}
        <div className="md:w-1/2 p-4 md:p-8 mt-4 md:mt-0 flex items-center justify-center">
          <Tracker />
        </div>        
      </main>
    </div>
  );
}

export default Popular