// ModalContent.tsx

import React from 'react';
import Image from 'next/image';

interface Currency {
  code: string;
  name: string;
}

const ModalContent: React.FC<{
  title: string;
  currencies: Currency[];
  onSelect: (currency: Currency) => void; // Ajuste a assinatura da função onSelect para receber um objeto Currency
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
            onClick={() => onSelect(currency)} // Passe o objeto Currency para onSelect
          >
            <div className="mr-2" style={{ width: '20px', height: '20px' }}>
              <Image
                src={`/assets/images/${currency.code.toLowerCase()}.png`}
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

export default ModalContent;