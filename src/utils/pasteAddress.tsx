import React from 'react';
import { FaPaste } from 'react-icons/fa';

interface AddressWithCopyProps {
  address: string;
}

const AddressWithCopy: React.FC<AddressWithCopyProps> = ({ address }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(address)
      .then(() => {
        alert('Address copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy address: ', err);
      });
  };

  return (
    <div className="flex items-center justify-center">
      <p className="sm:text-sm font-bold">{address}</p>
      <FaPaste
        className="ml-2 cursor-pointer text-black dark:text-white"
        size={24}
        onClick={handleCopy}
      />
    </div>
  );
};

export default AddressWithCopy;
