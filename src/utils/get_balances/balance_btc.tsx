import axios from 'axios';

export const getBtcBalance = async (btcAddress: string): Promise<number | null> => {
  try {
    const response = await axios.get(`https://api.blockcypher.com/v1/btc/main/addrs/${btcAddress}/balance`);
    const balanceInSatoshis = response.data.balance;
    return balanceInSatoshis / 100000000; // Convert satoshis to BTC
  } catch (error) {
    console.error('Error fetching BTC balance:', error);
    return null;
  }
};
