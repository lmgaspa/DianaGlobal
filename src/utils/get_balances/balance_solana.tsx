import React, { useState } from 'react';

const API_URL = 'https://graphql.bitquery.io/';
const API_KEY = 'BQY8IM5ckSrmqZqC5mTwlYgKcMGNlCbn';

const BalanceSolana: React.FC = () => {
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = async () => {
    setLoading(true);
    setError(null);

    const query = `
      query ($network: SolanaNetwork!, $address: String!) {
        solana(network: $network) {
          address(address: {is: $address}) {
            balance
          }
        }
      }
    `;

    const variables = {
      network: 'solana',
      address: address,
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': API_KEY,
        },
        body: JSON.stringify({
          query: query,
          variables: variables,
        }),
      });

      const data = await response.json();

      if (data.errors) {
        setError(data.errors[0].message);
      } else {
        setBalance(data.data.solana.address[0].balance);
      }
    } catch (error) {
      setError('Failed to fetch balance');
    }

    setLoading(false);
  };

  return (
    <div>
      <h1>Check Solana Address Balance</h1>
      <input
        type="text"
        placeholder="Enter Solana address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      <button onClick={fetchBalance} disabled={loading}>
        {loading ? 'Loading...' : 'Get Balance'}
      </button>
      {balance !== null && (
        <div>
          <h2>Balance: {balance} SOL</h2>
        </div>
      )}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
};

export default BalanceSolana;
