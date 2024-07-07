/*
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import ModalContent from './Modal'; // Importe o componente de modal

interface Currency {
  code: string;
  name: string;
}

interface ButtonsDepWithProps {
  btcAddress: string | null;
  solAddress: string | null;
  dogeAddress: string | null;
  dianaAddress: string | null;
  onSelectCurrency: (currencyCode: string, currencyName: string) => void;
}

const currencies: Currency[] = [
  { code: 'BTC', name: 'Bitcoin' },
  { code: 'SOL', name: 'Solana' },
  { code: 'DOGE', name: 'Dogecoin' },
  { code: 'DIANA', name: 'Dianacoin' }
];

const ButtonsDepWith: React.FC<ButtonsDepWithProps> = ({
  btcAddress,
  solAddress,
  dogeAddress,
  dianaAddress,
  onSelectCurrency
}) => {
  const router = useRouter();
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const handleModalOpen = (isDeposit: boolean) => {
    setShowDepositModal(isDeposit);
    setShowWithdrawModal(!isDeposit);
  };

  const handleOptionClick = (currency: Currency) => {
    const path = showWithdrawModal ? '/protected/withdraw' : '/protected/deposit';
    const address = getAddressByCurrency(currency);
    
    router.push({
      pathname: path,
      query: { address, currencyName: currency.name }
    });

    handleCloseModal();
    onSelectCurrency(currency.code, currency.name);
  };

  const getAddressByCurrency = (currency: Currency): string => {
    switch (currency.code) {
      case 'BTC': return btcAddress || '';
      case 'SOL': return solAddress || '';
      case 'DOGE': return dogeAddress || '';
      case 'DIANA': return dianaAddress || '';
      default: return '';
    }
  };

  const handleCloseModal = () => {
    setShowDepositModal(false);
    setShowWithdrawModal(false);
  };

  return (
    <div className="mt-8 flex justify-center">
      <div className="flex">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4"
          onClick={() => handleModalOpen(true)}
        >
          Deposit
        </button>
        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => handleModalOpen(false)}
        >
          Withdraw
        </button>
      </div>

      {showDepositModal && (
        <ModalContent
          title="Select a currency to deposit"
          currencies={currencies}
          onSelect={handleOptionClick}
          onClose={handleCloseModal}
        />
      )}

      {showWithdrawModal && (
        <ModalContent
          title="Select a currency to withdraw"
          currencies={currencies}
          onSelect={handleOptionClick}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default ButtonsDepWith;

*/
