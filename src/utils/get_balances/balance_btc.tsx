import axios from 'axios';

export const getBtcBalance = async (btcAddress: string): Promise<number | null> => {
  try {
    const response = await axios.get(`https://blockchain.info/q/addressbalance/${btcAddress}`);
    const balanceInSatoshis = parseFloat(response.data);
    return balanceInSatoshis / 100000000; // Convert satoshis to BTC
  } catch (error) {
    console.error('Error fetching BTC balance:', error);
    return null;
  }
};
