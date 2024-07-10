import React, { useState, useEffect } from 'react';
import axios from 'axios';
import crypto from 'crypto';

// Define types for the parameters
type Params = string;
type Secret = string;

const API_KEY = 'YOUR_API_KEY';
const SECRET_KEY = 'YOUR_SECRET_KEY';

// Update the function to include parameter types
const getSignature = (params: Params, secret: Secret): string => {
  return crypto.createHmac('sha256', secret).update(params).digest('hex');
};

// Update the function to accept parameters and return type
const getBalance = async (selectedCoin: string, coinAddress: string): Promise<string> => {
  const timestamp = Date.now();
  const params = `access_id=${API_KEY}&tonce=${timestamp}&coin=${selectedCoin}&address=${coinAddress}`;
  const signature = getSignature(params, SECRET_KEY);

  try {
    const response = await axios.get(`https://api.coinex.com/v2/balance?${params}&signature=${signature}`, {
      headers: {
        'Authorization': API_KEY,
      },
    });
    return response.data.balance.toString(); // Ensure the balance is returned as a string
  } catch (error) {
    console.error('Error fetching balance:', error);
    throw error;
  }
};

const BalanceComponent: React.FC = () => {
  const [withdrawBalance, setWithdrawBalance] = useState<number | null>(null);
  const selectedCoin: "BTC" | "DOGE" | "SOL" | "DIANA" = "BTC"; // example coin
  const coinAddress: string = "your_coin_address"; // example address

  const fetchBalance = async (selectedCoin: "BTC" | "DOGE" | "SOL" | "DIANA", coinAddress: string) => {
    if (coinAddress) {
      try {
        const balance = await getBalance(selectedCoin, coinAddress);
        setWithdrawBalance(parseFloat(balance));
        console.log(`Balance for ${selectedCoin}: ${parseFloat(balance)}`); // Adiciona o console.log aqui
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    }
  };

  // Call the function with example values when the component mounts
  useEffect(() => {
    fetchBalance(selectedCoin, coinAddress);
  }, [selectedCoin, coinAddress]);

  return (
    <div>
      {withdrawBalance !== null ? (
        <p>Balance for {selectedCoin}: {withdrawBalance}</p>
      ) : (
        <p>Loading balance...</p>
      )}
    </div>
  );
};

export default BalanceComponent;
