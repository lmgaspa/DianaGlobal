import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import QRCode from 'qrcode.react';

interface DepositCryptoProps {
  btcAddress: string | null;
  solAddress: string | null;
  dogeAddress: string | null;
  dianaAddress: string | null;
  selectedCurrency?: string;
  currencyName?: string;
}

const DepositCrypto: React.FC<DepositCryptoProps> = ({
  btcAddress,
  solAddress,
  dogeAddress,
  dianaAddress,
  selectedCurrency,
  currencyName,
}) => {
  const router = useRouter();
  const [address, setAddress] = useState<string>('');

  // Utilize useRef para armazenar os valores de currencyName e selectedCurrency
  const currencyNameRef = useRef<string | undefined>(currencyName);
  const selectedCurrencyRef = useRef<string | undefined>(selectedCurrency);

  useEffect(() => {
    const { address: queryAddress, currencyName: queryCurrencyName } = router.query;

    // Atualize os valores dos useRef se os valores das query params estiverem presentes
    if (queryCurrencyName && typeof queryCurrencyName === 'string') {
      currencyNameRef.current = queryCurrencyName;
      selectedCurrencyRef.current = queryCurrencyName.toUpperCase(); // Supondo que o nome da moeda sempre será convertido corretamente
    }

    if (typeof queryAddress === 'string') {
      setAddress(queryAddress);
    } else {
      // Determine qual endereço usar com base na moeda selecionada
      if (selectedCurrencyRef.current === 'BTC') {
        setAddress(btcAddress || '');
      } else if (selectedCurrencyRef.current === 'SOL') {
        setAddress(solAddress || '');
      } else if (selectedCurrencyRef.current === 'DOGE') {
        setAddress(dogeAddress || '');
      } else if (selectedCurrencyRef.current === 'DIANA') {
        setAddress(dianaAddress || '');
      }
    }
  }, [router.query, btcAddress, solAddress, dogeAddress, dianaAddress]);

  const handleBackToDashboard = () => {
    router.push('/protected/dashboard');
  };

  const handleDepositCrypto = () => {
    console.log('Depositing with currency:', currencyNameRef.current);
    router.push({
      pathname: '/protected/deposit',
      query: { address, currencyName: currencyNameRef.current },
    });
  };

  const handleWithdrawCrypto = () => {
    console.log('Withdrawing with currency:', currencyNameRef.current);
    router.push({
      pathname: '/protected/withdraw',
      query: { address, currencyName: currencyNameRef.current }, // Passa currencyName para a rota de retirada
    });
  };


  return (
    <div className="flex h-screen">
      <div className="w-3/10 p-4 border-r border-gray-300">
        <div>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded mr-4 w-full max-w-xs mb-2"
            onClick={handleBackToDashboard}
          >
            Back to Dashboard
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded mr-4 w-full max-w-xs mb-2"
            onClick={handleDepositCrypto}
          >
            Deposit Crypto
          </button>
        </div>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded mr-4 w-full max-w-xs"
          onClick={handleWithdrawCrypto}
        >
          Withdraw
        </button>
      </div>
      <div className="w-7/10 p-4">
        <h2 className="text-lg font-semibold mb-4">Deposit {currencyNameRef.current}</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Network</label>
          <p className="mt-1 text-sm text-gray-500">{currencyNameRef.current}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Deposit Address</label>
          <p className="mt-1 text-sm text-gray-500">
            {address ? `${currencyNameRef.current} Address: ${address}` : 'Loading address...'}
          </p>
        </div>
        {address && (
          <div className="mt-4">
            <QRCode value={address} size={128} />
          </div>
        )}
      </div>
    </div>
  );
};

export default DepositCrypto;
  