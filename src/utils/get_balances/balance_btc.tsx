import axios from 'axios';

export const getBtcBalance = async (btcAddress: string): Promise<number | null> => {
  try {
    const response = await axios.get(`/api/proxy?btcAddress=${btcAddress}`);
    const balanceInSatoshis = response.data.balance;
    return balanceInSatoshis / 100000000; // Convert satoshis to BTC
  } catch (error) {
    console.error('Error fetching BTC balance:', error);
    return null;
  }
};
