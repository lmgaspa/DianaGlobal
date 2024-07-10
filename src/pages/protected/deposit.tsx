"use client";

import React, { useState, useEffect } from 'react';
import { useSession, getSession } from 'next-auth/react';
import Image from 'next/image';
import Select from 'react-select';
import QRCode from 'qrcode.react';
import { useRouter } from 'next/router';
import btc from '../../../public/assets/images/btc.png';
import sol from '../../../public/assets/images/sol.png';
import doge from '../../../public/assets/images/doge.png';
import diana from '../../../public/assets/images/diana.png';
import AddressWithCopy from '@/utils/pasteAddress';

type StaticImageData = {
    src: string;
    height: number;
    width: number;
    placeholder?: string;
};

interface Coin {
    name: string;
    label: string;
    symbol: 'BTC' | 'DOGE' | 'SOL' | 'DIANA';
    image: StaticImageData;
}

const coins: Coin[] = [
    { name: 'BITCOIN', label: 'Bitcoin', symbol: 'BTC', image: btc },
    { name: 'SOLANA', label: 'Solana', symbol: 'SOL', image: sol },
    { name: 'DOGECOIN', label: 'Dogecoin', symbol: 'DOGE', image: doge },
    { name: 'DIANACOIN', label: 'DianaCoin', symbol: 'DIANA', image: diana },
];

type NetworkKeys = 'BTC' | 'SOL' | 'DOGE' | 'DIANA';

const networks: Record<NetworkKeys, string[]> = {
    BTC: ['Bitcoin'],
    SOL: ['Solana'],
    DOGE: ['Dogecoin'],
    DIANA: ['Solana'],
};

const Deposit: React.FC = () => {
    const { status } = useSession();
    const router = useRouter();
    const { userId, name, btcAddress, solAddress, dogeAddress, dianaAddress } = router.query;
    const userIdStr = (userId as string) ?? '';
    const nameStr = (name as string) ?? '';
    const btcAddressStr = (btcAddress as string) ?? '';
    const solAddressStr = (solAddress as string) ?? '';
    const dogeAddressStr = (dogeAddress as string) ?? '';
    const dianaAddressStr = (dianaAddress as string) ?? '';

    useEffect(() => {
        console.log('UserId:', userIdStr);
        console.log('Name:', nameStr);
        console.log('BTC Address:', btcAddressStr);
        console.log('SOL Address:', solAddressStr);
        console.log('DOGE Address:', dogeAddressStr);
        console.log('DIANA Address:', dianaAddressStr);
    }, [userIdStr, nameStr, btcAddressStr, solAddressStr, dogeAddressStr, dianaAddressStr]);

    const [selectedCoin, setSelectedCoin] = useState<NetworkKeys | ''>('');
    const [selectedNetwork, setSelectedNetwork] = useState<string | ''>('');

    useEffect(() => {
        setSelectedNetwork(''); // Reset selected network whenever selected coin changes
    }, [selectedCoin]);

    const handleCoinSelect = (selectedOption: any) => {
        setSelectedCoin(selectedOption.value);
    };

    const handleNetworkSelect = (selectedOption: any) => {
        setSelectedNetwork(selectedOption.value);
    };

    if (status === 'loading') {
        return <div>Loading...</div>;
    }

    const getAddress = () => {
        switch (selectedCoin) {
            case 'BTC':
                return btcAddressStr;
            case 'SOL':
                return solAddressStr;
            case 'DOGE':
                return dogeAddressStr;
            case 'DIANA':
                return dianaAddressStr;
            default:
                return '';
        }
    };

    const coinOptions = coins.map((coin) => ({
        value: coin.symbol,
        label: (
            <div className="flex items-center">
                <Image src={coin.image.src} alt={coin.symbol.toLowerCase()} width={30} height={30} objectFit="contain" />
                <span className="ml-2">{coin.label}</span>
            </div>
        ),
    }));

    const networkOptions = selectedCoin
        ? networks[selectedCoin].map((network) => ({
            value: network,
            label: network,
        }))
        : [];

    return (
        <div className="flex flex-col md:flex-row">
            <div className="md:w-2/4 p-4 border-r text-center border-gray-300 bg-white dark:bg-black">
                <div>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded mb-2 w-2/3"
                        onClick={() => router.push('/protected/dashboard')}
                    >
                        Back to Dashboard
                    </button>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded mb-2 w-2/3"
                        onClick={() => router.push({
                            pathname: '/protected/deposit',
                            query: { userId, name, btcAddress, solAddress, dogeAddress, dianaAddress },
                        })}
                    >
                        Deposit Crypto
                    </button>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded w-2/3"
                        onClick={() => router.push({
                            pathname: '/protected/withdraw',
                            query: { userId, name, btcAddress, solAddress, dogeAddress, dianaAddress },
                        })}
                    >
                        Withdraw
                    </button>
                </div>
            </div>
            <div className="flex w-full justify-center  min-h-screen h-screen
       bg-white dark:bg-black text-white p-6">
                <div className="w-full sm:w-full sm:border sm:rounded-3xl md:w-5/6 lg:w-2/4
         bg-blue-300 text-black dark:bg-black dark:text-white py-8 px-4 mb-12 ">
                    <div className="mb-10">
                        <h3 className="text-lg font-semibold mb-4">Select Coin</h3>
                        <Select
                            value={coinOptions.find((option) => option.value === selectedCoin)}
                            onChange={handleCoinSelect}
                            options={coinOptions}
                            classNamePrefix="react-select"
                            styles={{
                                control: (base) => ({
                                    ...base,
                                    backgroundColor: 'rgba(255, 255, 255, 1)',
                                    borderColor: 'rgba(107, 114, 128, 1)',
                                    borderRadius: '9999px',
                                    width: '100%',
                                }),
                                menu: (base) => ({
                                    ...base,
                                    backgroundColor: 'rgba(255, 255, 255, 1)',
                                    borderColor: 'rgba(107, 114, 128, 1)',
                                    color: 'black',
                                    width: '100%',
                                }),
                                singleValue: (base) => ({
                                    ...base,
                                    color: 'black',
                                }),
                                input: (base) => ({
                                    ...base,
                                    color: 'black',
                                }),
                                placeholder: (base) => ({
                                    ...base,
                                    color: 'black',
                                }),
                            }}
                            className="text-black dark:text-white w-full"
                        />
                    </div>
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-4">Select Network</h3>
                        {selectedCoin && (
                            <Select
                                value={networkOptions.find((option) => option.value === selectedNetwork) || null}
                                onChange={handleNetworkSelect}
                                options={networkOptions}
                                classNamePrefix="react-select"
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        backgroundColor: 'rgba(255, 255, 255, 1)',
                                        borderColor: 'rgba(107, 114, 128, 1)',
                                        borderRadius: '9999px',
                                        width: '100%',
                                    }),
                                    menu: (base) => ({
                                        ...base,
                                        backgroundColor: 'rgba(255, 255, 255, 1)',
                                        borderColor: 'rgba(107, 114, 128, 1)',
                                        color: 'black',
                                        width: '100%',
                                    }),
                                    singleValue: (base) => ({
                                        ...base,
                                        color: 'black',
                                    }),
                                    input: (base) => ({
                                        ...base,
                                        color: 'black',
                                    }),
                                    placeholder: (base) => ({
                                        ...base,
                                        color: 'black',
                                    }),
                                }}
                                className="text-black dark:text-white w-full"
                            />
                        )}
                    </div>
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-4">Deposit Address</h3>
                        {selectedCoin && selectedNetwork && (
                            <div className="flex flex-col items-center w-full">
                                <div className="w-48 h-48 bg-gray-700 flex items-center justify-center mb-4">
                                    <QRCode value={getAddress()} size={192} />
                                </div>
                                <div className="text-center w-full">
                                    <p className="text-lg">Address</p>
                                    <AddressWithCopy address={getAddress()} />
                                    <p className="text-lg mt-2">Minimum deposit</p>
                                    <p className="text-base">More than 0.000006 {selectedCoin}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Deposit;

export const getServerSideProps = async (context: any) => {
    const session = await getSession(context);

    if (!session) {
        return {
            redirect: {
                destination: '/login',
                permanent: false,
            },
        };
    }

    const { user } = session;
    const { userId, name, btcAddress, solAddress, dogeAddress, dianaAddress } = context.query;

    console.log('Session user:', user);
    console.log('BTC Address:', btcAddress);
    console.log('SOL Address:', solAddress);
    console.log('DOGE Address:', dogeAddress);
    console.log('DIANA Address:', dianaAddress);

    if (!userId || !name || !btcAddress || !solAddress || !dogeAddress || !dianaAddress) {
        return {
            redirect: {
                destination: '/login',
                permanent: false,
            },
        };
    }

    return {
        props: {
            userId: userId ?? '',
            name: name ?? '',
            btcAddress: btcAddress ?? '',
            solAddress: solAddress ?? '',
            dogeAddress: dogeAddress ?? '',
            dianaAddress: dianaAddress ?? '',
        },
    };
};
