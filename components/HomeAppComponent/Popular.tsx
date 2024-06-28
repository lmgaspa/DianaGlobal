import React from 'react';
import Image from 'next/image';
import Tracker from '../CryptoTracker/Tracker'

const Popular: React.FC = () => {
  return (
    <div>
      <main className="flex flex-col md:flex-row items-center justify-between pt-8 md:pt-24 p-11">
        {/* Esquerda */}
        <div className="md:w-1/2 p-8 text-container">
          <h1 className="text-7xl font-bold mb-4">Start Trading Today</h1>
          <p className="text-lg text-justify">
             Hello
          </p>
        </div>
        {/* Direita */}
        <div className="md:w-1/2 p-8 mr-4 ml-4 mt-8 md:mt-0 flex items-center justify-center">
          <Tracker />
    </div>        
    </main>
    </div>
  );
};

export default Popular