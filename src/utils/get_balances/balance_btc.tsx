import React, { useState } from 'react';

const BalanceBitcoin: React.FC = () => {
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://blockchain.info/q/addressbalance/${address}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const balanceInSatoshis = await response.text();
      const balanceInBTC = parseFloat(balanceInSatoshis) / 100000000; // Convert satoshis to BTC
      setBalance(balanceInBTC);
    } catch (error) {
      setError('Failed to fetch balance');
    }

    setLoading(false);
  };

  return (
    <div>
      <h1>Check Bitcoin Address Balance</h1>
      <input
        type="text"
        placeholder="Enter Bitcoin address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      <button onClick={fetchBalance} disabled={loading}>
        {loading ? 'Loading...' : 'Get Balance'}
      </button>
      {balance !== null && (
        <div>
          <h2>Balance: {balance} BTC</h2>
        </div>
      )}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
};

export default BalanceBitcoin;
