import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

interface Currency {
  code: string;
  name: string;
}

interface ButtonsDepWithProps {
  btcAddress: string | null;
  solAddress: string | null;
  onSelectCurrency: (currency: string, currencyName: string) => void;
}

const currencies: Currency[] = [
  { code: 'BTC', name: 'Bitcoin' },
  { code: 'SOL', name: 'Solana' },
  // Add more currencies as needed
];

const ModalContent: React.FC<{
  title: string;
  currencies: Currency[];
  onSelect: (currency: Currency) => void;
  onClose: () => void;
}> = ({ title, currencies, onSelect, onClose }) => (
  <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
    <div className="bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="flex items-center">
        {currencies.map((currency) => (
          <button
            key={currency.code}
            className="flex items-center p-2 rounded-lg hover:bg-gray-200"
            onClick={() => onSelect(currency)}
          >
            <div className="mr-2" style={{ width: '20px', height: '20px' }}>
              <Image
                src={`/assets/images/${currency.code.toLowerCase()}.png`} // Adjust the path as per your structure
                alt={currency.code}
                width={20}
                height={20}
                layout="responsive"
                objectFit="contain"
              />
            </div>
            <span className="text-lg font-medium">{currency.code}</span>
          </button>
        ))}
      </div>
      <div className="mt-4 flex justify-end">
        <button className="text-blue-500 hover:text-blue-700 font-medium" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  </div>
);

const ButtonsDepWith: React.FC<ButtonsDepWithProps> = ({ btcAddress, solAddress, onSelectCurrency }) => {
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
    onSelectCurrency(currency.code, currency.name);

    let path = '/protected/deposit';
    if (showWithdrawModal) {
      path = '/protected/withdraw';
    }

    router.push({
      pathname: path,
      query: { address: currency.code === 'BTC' ? btcAddress : solAddress },
    });

    handleCloseModal();
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

