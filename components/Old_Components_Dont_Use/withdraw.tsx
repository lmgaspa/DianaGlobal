/*

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';

interface WithdrawCryptoProps {
  btcAddress: string | null;
  solAddress: string | null;
  dogeAddress: string | null;
  dianaAddress: string | null;
  selectedCurrency?: string;
  currencyName?: string;
}

const WithdrawCrypto: React.FC<WithdrawCryptoProps> = ({
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
        <h2 className="text-lg font-semibold mb-4">Withdraw {currencyNameRef.current}</h2>
        <form>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Withdraw Address</label>
            <input
              type="text"
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Withdraw Amount</label>
            <input
              type="number"
              step="0.0001"
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              required
            />
          </div>
          <p className="mb-4">Minimal amount for withdraw is 0.000001 {currencyNameRef.current}</p>
          <p className="mb-4">Fee for withdraw is 0.000001 {selectedCurrencyRef.current}</p>
          <button
            type="submit"
            className="bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded"
          >
            Submit Withdraw
          </button>
        </form>
      </div>
    </div>
  );
};

export default WithdrawCrypto;

*/