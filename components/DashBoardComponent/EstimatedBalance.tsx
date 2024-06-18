import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from 'next-auth/react';
import BalanceBitcore from '@/components/DashBoardComponent/BalanceBitcore'; // Ensure the path is correct
import ButtonsDepWith from '@/components/DashBoardComponent/ButtonsDepWith'; // Ensure the path is correct

const EstimatedBalance: React.FC = () => {
  const [btcaddress, setBtcaddress] = useState<string | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchAddress = async () => {
      if (session?.user && !btcaddress) {
        const userId = session.user.id; // Capture userId here for logging
        console.log('Fetching address for userId:', userId);

        try {
          const response = await axios.post('https://btcwallet-new.onrender.com/wallet/', {
            userId: userId
          });

          const data = response.data;
          console.log('Response data:', data); // Log response data
          setBtcaddress(data.btcaddress);
        } catch (error) {
          console.error('Error fetching address:', error);
          setBtcaddress(''); // Handle error state
        }
      }
    };

    fetchAddress();
  }, [session, btcaddress]);  

  return (
    <div>
      <BalanceBitcore btcaddress={btcaddress} />
      <ButtonsDepWith />
    </div>
  );
};

export default EstimatedBalance;
