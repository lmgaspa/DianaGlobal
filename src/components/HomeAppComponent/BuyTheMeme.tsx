import React from 'react';
import Image from 'next/image';

const BuyTheMeme: React.FC = () => {
    return (
        <div className="flex md:flex-row items-center p-4 md:p-8
        bg-pink-200 dark:bg-gray-400 text-black dark:text-black" >
            <div className="flex items-center justify-center w-1/3">
                <Image
                    src="/assets/images/diana.png"
                    alt="Diana Token"
                    priority
                    width={400}
                    height={400}
                />
            </div>
            <div className="w-2/3 text-center md:text-left">
                <h1 className="text-5xl font-bold md:text-6xl mb-2 ml-6">Buy the Meme!</h1>
            </div>
        </div>
    );
}

export default BuyTheMeme;
