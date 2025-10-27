// pages/api/proxy.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { btcAddress } = req.query;

  if (!btcAddress || typeof btcAddress !== 'string') {
    res.status(400).json({ error: 'BTC address is required' });
    return;
  }

  try {
    console.log(`Fetching BTC balance for address: ${btcAddress}`); // Adicionando log
    const response = await axios.get(`https://api.bitcore.io/api/BTC/mainnet/address/${btcAddress}/balance`);
    console.log(`Response from Bitcore: ${JSON.stringify(response.data)}`); // Adicionando log
    res.status(200).json(response.data);
  } catch (error: any) {
    console.error('Error fetching BTC balance:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data); // Adicionando log para a resposta de erro
      res.status(error.response.status).json({ error: error.response.data });
    } else {
      res.status(500).json({ error: 'Failed to fetch BTC balance' });
    }
  }
}
