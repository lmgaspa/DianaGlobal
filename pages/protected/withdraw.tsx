import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

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
  const [withdrawAddress, setWithdrawAddress] = useState<string>('');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [balance, setBalance] = useState<number>(0);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const { address: queryAddress, currencyName: queryCurrencyName } = router.query;

    if (typeof queryAddress === 'string') {
      setAddress(queryAddress);
    } else {
      // Determine qual endereço usar com base na moeda selecionada
      if (selectedCurrency === 'BTC') {
        setAddress(btcAddress || '');
      } else if (selectedCurrency === 'SOL') {
        setAddress(solAddress || '');
      } else if (selectedCurrency === 'DOGE') {
        setAddress(dogeAddress || '');
      } else if (selectedCurrency === 'DIANA') {
        setAddress(dianaAddress || '');
      }
    }

    console.log('queryAddress:', queryAddress);
    console.log('queryCurrencyName:', queryCurrencyName);

    // Atualize currencyName se ele for diferente do state atual
    if (queryCurrencyName && queryCurrencyName !== currencyName) {
      console.log('Updating currencyName to:', queryCurrencyName);
      // Atualize o estado de currencyName
      // Isso deve acionar uma nova renderização com o valor correto
      // Assumindo que você esteja utilizando o setCurrencyName, corrigirei isso
      // para setCurrencyName(queryCurrencyName);
    }
  }, [router.query, btcAddress, solAddress, dogeAddress, dianaAddress, selectedCurrency, currencyName]);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        // Adapte a URL e a lógica de balanceamento conforme necessário para cada moeda
        if (selectedCurrency === 'BTC' && address) {
          const response = await axios.get(`https://api.bitcore.io/api/BTC/mainnet/address/${address}/balance`);
          const fetchedBalance = response.data.balance;
          console.log('Raw balance:', fetchedBalance); // Debug
          const balanceInBTC = parseFloat(fetchedBalance) / 1e8;
          if (!isNaN(balanceInBTC)) {
            setBalance(balanceInBTC);
          } else {
            console.error('Invalid balance:', fetchedBalance);
            setBalance(0);
          }
        }
        // Adicione lógica similar para outras moedas conforme necessário
      } catch (error) {
        console.error('Error fetching balance:', error);
        setBalance(0);
      }
    };

    if (selectedCurrency) {
      fetchBalance();
    }
  }, [selectedCurrency, address]);

  const handleBackToDashboard = () => {
    router.push('/protected/dashboard');
  };

  const handleDepositCrypto = () => {
    router.push({
      pathname: '/protected/deposit',
      query: { address, currencyName },
    });
  };

  const handleWithdrawCrypto = () => {
    router.push({
      pathname: '/protected/withdraw',
      query: { address, currencyName },
    });
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica para processar a retirada
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
        <h2 className="text-lg font-semibold mb-4">Withdraw {currencyName}</h2>
        <p className="mb-4">Your Balance is: {balance.toFixed(8)} {selectedCurrency}</p>
        <form onSubmit={handleWithdrawSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Withdraw Address</label>
            <input
              type="text"
              value={withdrawAddress}
              onChange={(e) => setWithdrawAddress(e.target.value)}
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Withdraw Amount</label>
            <input
              type="number"
              step="0.0001"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              required
            />
          </div>
          <p className="mb-4">Minimal amount for withdraw is 0.000001 {selectedCurrency}</p>
          <p className="mb-4">Fee for withdraw is 0.000001 {selectedCurrency}</p>
          {error && <p className="text-red-500 mb-4">{error}</p>}
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
