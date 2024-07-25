"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BalanceBitcoin from './balance_btc';
import BalanceSolana from './balance_solana';
import BalanceDogecoin from './balance_dogecoin';

type NetworkKeys = 'BTC' | 'SOL' | 'DOGE' | 'DIANA';

const Balance: React.FC = () => {
  const [selectedCoin, setSelectedCoin] = useState<NetworkKeys | ''>('');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [balance, setBalance] = useState<number | null>(null);
  
  useEffect(() => {
    const fetchBalance = async () => {
      switch (selectedCoin) {
        case 'BTC':
          const bitcoinResponse = await axios.get(`https://blockchain.info/q/addressbalance/${btcAddress}`);
          const balanceInSatoshis = parseFloat(bitcoinResponse.data);
          setBalance(balanceInSatoshis / 100000000); // Convert satoshis to BTC
          break;
        case 'SOL':
          // Use BalanceSolana component to fetch balance
          // Assuming BalanceSolana exposes a method to get balance
          const solanaBalance = await BalanceSolana.getBalance(solAddress);
          setBalance(solanaBalance);
          break;
        case 'DOGE':
          const dogecoinResponse = await axios.post(API_URL, {
            query: `
              query ($network: String!, $address: String!) {
                bitcoin(network: $network) {
                  addressStats(address: {is: $address}) {
                    address {
                      balance
                    }
                  }
                }
              }
            `,
            variables: { network: 'dogecoin', address: dogeAddress }
          }, {
            headers: { 'X-API-KEY': API_KEY }
          });
          const balanceInDogecoin = dogecoinResponse.data.data.bitcoin.addressStats[0].address.balance / 100000000;
          setBalance(balanceInDogecoin);
          break;
        default:
          setBalance(null);
      }
    };

    if (selectedCoin) {
      fetchBalance();
    }
  }, [selectedCoin]);

  const handleMaxClick = () => {
    if (balance !== null) {
      setWithdrawAmount(balance.toString());
    }
  };

  return (
    <div>
      <h1>Check and Withdraw Balance</h1>
      <select onChange={(e) => setSelectedCoin(e.target.value as NetworkKeys)} value={selectedCoin}>
        <option value="">Select Coin</option>
        <option value="BTC">Bitcoin</option>
        <option value="SOL">Solana</option>
        <option value="DOGE">Dogecoin</option>
        <option value="DIANA">DianaCoin</option>
      </select>
      <button onClick={handleMaxClick}>Max</button>
      <input
        type="text"
        placeholder="Enter amount to withdraw"
        value={withdrawAmount}
        onChange={(e) => setWithdrawAmount(e.target.value)}
      />
      <div>
        {balance !== null ? (
          <h2>Balance: {balance} {selectedCoin}</h2>
        ) : (
          <p>Select a coin to see balance</p>
        )}
      </div>
    </div>
  );
};

export default Balance;
