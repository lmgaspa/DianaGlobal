import axios from 'axios';

export const getBtcBalance = async (btcAddress: string): Promise<number | null> => {
  try {
    if (!btcAddress) {
      throw new Error('BTC address is required');
    }
    console.log('Fetching balance for BTC address:', btcAddress); // Debug log

    const response = await axios.get(`/api/proxy?btcAddress=${btcAddress}`);
    console.log('Response from proxy:', response.data); // Adicionando log
    const balanceInSatoshis = response.data.balance;
    return balanceInSatoshis / 100000000; // Convert satoshis to BTC
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error fetching BTC balance:', error.response?.data || error.message);
    } else {
      console.error('Unknown error fetching BTC balance:', error);
    }
    return null;
  }
};
