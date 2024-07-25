
import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { btcAddress } = req.query;

  if (!btcAddress || typeof btcAddress !== 'string') {
    return res.status(400).json({ error: 'Invalid BTC address' });
  }

  try {
    const response = await axios.get(`https://api.blockcypher.com/v1/btc/main/addrs/${btcAddress}/balance`);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching BTC balance' });
  }
};

export default handler;