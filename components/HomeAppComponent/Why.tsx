import React from 'react';

const Why: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between text-center pt-22 p-8">
      {/* Left */}
      <div className="md:w-1/3 p-8">
        <h2 className="text-3xl font-bold mb-4">Why Diana Global?</h2>
        <p>
          With Diana Global, buying crypto is easy using our mobile apps.
        </p>
      </div>
      {/* Center */}
      <div className="md:w-1/3 p-8">
        <h2 className="text-3xl font-bold mb-4">Wanna Start?</h2>
        <p>
          Not sure where to start? Access our Tutorial Center and learn all about cryptocurrencies.
        </p>
      </div>
      {/* Right */}
      <div className="md:w-1/3 p-8">
        <h2 className="text-3xl font-bold mb-4">Talk with Us</h2>
        <p>
          Find answers to your questions in our Support Center. Or contact us via live chat 24/7.
        </p>
      </div>
    </div>
  );
};

export default Why;
