import React from 'react';
import Image from 'next/image';

const Explore: React.FC = () => {
    return (
        <div className="w-full p-4 bg-blue-100 dark:bg-gray-800 text-white dark:text-gray-100">
            <div className="container mx-auto px-4 mb-6">
                <div className="text-center mb-4">
                    <h2 className="text-3xl font-bold mb-8 text-center">Explore the Crypto Market</h2>
                </div>
                <div className="grid grid-cols-3 gap-6">
                    <div className="relative w-full h-24">
                        <Image
                            src="/assets/images/btc.png"
                            alt="btc"
                            style={{ objectFit: 'contain' }}
                            fill
                            sizes="(max-width: 600px) 100vw, 33vw"
                        />
                    </div>
                    <div className="relative w-full h-24">
                        <Image
                            src="/assets/images/eth.png"
                            alt="eth"
                            style={{ objectFit: 'contain' }}
                            fill
                            sizes="(max-width: 600px) 100vw, 33vw"
                        />
                    </div>
                    <div className="relative w-full h-24">
                        <Image
                            src="/assets/images/bnb.png"
                            alt="bnb"
                            style={{ objectFit: 'contain' }}
                            fill
                            sizes="(max-width: 600px) 100vw, 33vw"
                        />
                    </div>
                    <div className="relative w-full h-24">
                        <Image
                            src="/assets/images/xrp.png"
                            alt="xrp"
                            style={{ objectFit: 'contain' }}
                            fill
                            sizes="(max-width: 600px) 100vw, 33vw"
                        />
                    </div>
                    <div className="relative w-full h-24">
                        <Image
                            src="/assets/images/dia.png"
                            alt="diana"
                            style={{ objectFit: 'contain' }}
                            fill
                            sizes="(max-width: 600px) 100vw, 33vw"
                        />
                    </div>
                    <div className="relative w-full h-24">
                        <Image
                            src="/assets/images/doge.png"
                            alt="doge"
                            style={{ objectFit: 'contain' }}
                            fill
                            sizes="(max-width: 600px) 100vw, 33vw"
                        />
                    </div>
                    <div className="relative w-full h-24">
                        <Image
                            src="/assets/images/ltc.png"
                            alt="ltc"
                            style={{ objectFit: 'contain' }}
                            fill
                            sizes="(max-width: 600px) 100vw, 33vw"
                        />
                    </div>
                    <div className="relative w-full h-24">
                        <Image
                            src="/assets/images/dot.png"
                            alt="dot"
                            style={{ objectFit: 'contain' }}
                            fill
                            sizes="(max-width: 600px) 100vw, 33vw"
                        />
                    </div>
                    <div className="relative w-full h-24">
                        <Image
                            src="/assets/images/pepe.png"
                            alt="pepe"
                            style={{ objectFit: 'contain' }}
                            fill
                            sizes="(max-width: 600px) 100vw, 33vw"
                        />
                    </div>
                </div>
            </div>
        </div>

    );
}

export default Explore;
