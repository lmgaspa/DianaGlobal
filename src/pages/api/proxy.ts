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
  } catch (error: unknown) {
    const axiosError = error as { message?: string; response?: { status?: number; data?: unknown } };
    console.error('Error fetching BTC balance:', axiosError.message);
    if (axiosError.response) {
      console.error('Response data:', axiosError.response.data); // Adicionando log para a resposta de erro
      res.status(axiosError.response.status || 500).json({ error: axiosError.response.data });
    } else {
      res.status(500).json({ error: 'Failed to fetch BTC balance' });
    }
  }
}
