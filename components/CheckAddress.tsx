// CheckAddress.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface CheckAddressProps {
  userId: string;
}

const CheckAddress: React.FC<CheckAddressProps> = ({ userId }) => {
  const [address, setAddress] = useState<string>('');

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        // Simulando uma chamada para obter o endereço do usuário com base no userId
        const response = await axios.get(`https://api.example.com/user/${userId}/address`);
        const fetchedAddress = response.data.address;
        setAddress(fetchedAddress);
      } catch (error) {
        console.error('Error fetching address:', error);
      }
    };

    fetchAddress();
  }, [userId]);

  return (
    <div>
      <p>User ID: {userId}</p>
      <p>User Address: {address}</p>
    </div>
  );
};

export default CheckAddress;
