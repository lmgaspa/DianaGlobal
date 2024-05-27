import React from 'react';
import Image from 'next/image';

const Explore: React.FC = () => {
    return (
        <div className="w-full p-4 bg-black dark:bg-gray-800 text-white dark:text-gray-100">
            <div className="container mx-auto px-4">
                <div className="text-center mb-4">
                    <h2 className="text-3xl font-bold mb-8 text-center">Explore the Crypto Market</h2>
                </div>
                <div className="grid grid-cols-3 gap-6">
                    <div className="relative w-full h-24">
                        <Image src="/assets/images/btc.png" alt="btc" layout="fill" objectFit="contain" />
                    </div>
                    <div className="relative w-full h-24">
                        <Image src="/assets/images/eth.png" alt="eth" layout="fill" objectFit="contain" />
                    </div>
                    <div className="relative w-full h-24">
                        <Image src="/assets/images/bnb.png" alt="bnb" layout="fill" objectFit="contain" />
                    </div>
                    <div className="relative w-full h-24">
                        <Image src="/assets/images/xrp.png" alt="xrp" layout="fill" objectFit="contain"
                        />
                    </div>
                    <div className="relative w-full h-24">
                        <Image src="/assets/images/dia.png" alt="diana" layout="fill" objectFit="contain"
                        />
                    </div>
                    <div className="relative w-full h-24">
                        <Image src="/assets/images/doge.png" alt="doge" layout="fill" objectFit="contain" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Explore;
