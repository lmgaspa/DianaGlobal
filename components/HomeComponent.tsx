import React from 'react';
import Image from 'next/image';

const HomeComponent: React.FC = () => {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
       <main className="flex flex-col md:flex-row items-center justify-between pt-8 md:pt-24 p-11">
        {/* Esquerda */}
        <div className="md:w-1/2 p-8 text-container">
          <h1 className="text-7xl font-bold mb-4">Start Trading Today</h1>
          <p className="text-lg text-justify">
            Invest in the future with cryptocurrency. Start trading today and unlock the potential of digital assets. Join Diana Global and embark on your journey to financial freedom with cutting-edge technology and expert guidance.
          </p>
        </div>
        {/* Direita */}
        <div className="md:w-1/2 p-8 mr-8 mt-8 md:mt-0 flex items-center justify-center">
          <Image
            src="/assets/images/DianaWalletScreen.png"
            alt="Wallet Screen"
            layout="intrinsic"
            width={250} // Diminuí a largura para 200px
            height={250} // Ajustei a altura proporcionalmente para 150px
            objectFit="contain"
          />
        </div>
      </main>

      <style jsx>{`
        .text-container {
          margin-left: 5%; // Adicionando margem à esquerda para mover o texto mais para a direita
        }
      `}</style>
    </div>
  );
};

export default HomeComponent;
