// pages/api/proxy.tsx

import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { btcAddress } = req.query;

  console.log('Received BTC address:', btcAddress);

  if (!btcAddress || typeof btcAddress !== 'string') {
    console.error('Invalid BTC address:', btcAddress);
    return res.status(400).json({ error: 'Invalid BTC address' });
  }

  try {
    const response = await axios.get(`https://api.blockcypher.com/v1/btc/main/addrs/${btcAddress}/balance`);
    console.log('API Response:', response.data);
    res.status(200).json(response.data);
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      // Verifica se o erro é de uma requisição Axios
      console.error('Axios error fetching BTC balance:', error.response?.data || error.message);
      res.status(error.response?.status || 500).json({ error: error.response?.data || 'Error fetching BTC balance' });
    } else {
      // Erro genérico
      console.error('Unknown error fetching BTC balance:', error);
      res.status(500).json({ error: 'Unknown error fetching BTC balance' });
    }
  }
};

export default handler;
