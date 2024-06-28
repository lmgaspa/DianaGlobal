// ButtonsDepWith.tsx

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import ModalContent from './DepositWithdrawModal'; // Importe o componente de modal

interface Currency {
  code: string;
  name: string;
}

interface ButtonsDepWithProps {
  btcAddress: string | null;
  solAddress: string | null;
  onSelectCurrency: (currencyCode: string, currencyName: string) => void;
}

const currencies: Currency[] = [
  { code: 'BTC', name: 'Bitcoin' },
  { code: 'SOL', name: 'Solana' },
  // Adicione mais moedas conforme necessário
];

const ButtonsDepWith: React.FC<ButtonsDepWithProps> = ({ btcAddress, solAddress, onSelectCurrency,   }) => {
  const router = useRouter();
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const handleModalOpen = (isDeposit: boolean) => {
    if (isDeposit) {
      setShowDepositModal(true);
      setShowWithdrawModal(false);
    } else {
      setShowWithdrawModal(true);
      setShowDepositModal(false);
    }
  };

  const handleOptionClick = (currency: Currency) => {
    let path = '/protected/deposit';
    if (showWithdrawModal) {
      path = '/protected/withdraw';
    }

    router.push({
      pathname: path,
      query: { address: currency.code === 'BTC' ? btcAddress : solAddress, currencyName: currency.name,} 
    });

    handleCloseModal();
    onSelectCurrency(currency.code, currency.name); // Chame a função onSelectCurrency com o código e o nome da moeda selecionada
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
