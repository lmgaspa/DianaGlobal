import React from 'react';

const HomeComponent: React.FC = () => {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
       <main className="flex flex-col md:flex-row items-center justify-between pt-24 p-8">
        {/* Esquerda */}
        <div className="md:w-1/2 p-8">
          <h1 className="text-4xl font-bold mb-4">Start Trading Today</h1>
          <p className="text-lg text-justify">
            Invest in the future with cryptocurrency. Start trading today and unlock the potential of digital assets. Join Diana Global and embark on your journey to financial freedom with cutting-edge technology and expert guidance.
          </p>
        </div>
        {/* Direita */}
        <div className="md:w-1/2 p-8 flex items-center justify-center">
        </div>
      </main>
    </div>
  );
};

export default HomeComponent;
