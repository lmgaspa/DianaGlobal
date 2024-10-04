import React from 'react';
import Image from 'next/image';

const HomeComponent: React.FC = () => {
  return (
    <div>
      <main className="flex flex-col md:flex-row items-center justify-between pt-8 md:pt-24 p-11 text-black dark:bg-black dark:text-white">
   
        <div className="md:w-1/2 text-container md:ml-12 md:pl-12">
          <h1 className="text-7xl text-center font-bold mb-4">Start Trading Today</h1>
          <p className="text-lg text-justify mt-6 ">
            Invest in the future with cryptocurrency. Start trading today and unlock the potential of digital assets. Join Diana Global and embark on your journey to financial freedom with cutting-edge technology and expert guidance.
          </p>
        </div>
       
        <div className="md:w-1/2 p-8 mr-4 ml-4 mt-8 md:mt-0 flex items-center justify-center">
          <Image
            src="/assets/images/wallet.png" 
            alt="Wallet Screen"
            width={350} // Diminuí a largura para 200px
            height={350} // Ajustei a altura proporcionalmente para 150px
            priority
          />
        </div>
      </main>
    </div>
  );
};

export default HomeComponent;
