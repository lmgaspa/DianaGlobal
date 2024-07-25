import { getBtcBalance } from './balance_btc';
import { getSolanaBalance } from './balance_solana';
import { getDogecoinBalance } from './balance_dogecoin';

type NetworkKeys = 'BTC' | 'SOL' | 'DOGE' | 'DIANA';

export const fetchBalances = async (btcAddress: string, solAddress: string, dogeAddress: string, dianaAddress: string) => {
  const balances: Record<NetworkKeys, number | null> = {
    BTC: null,
    SOL: null,
    DOGE: null,
    DIANA: null,
  };

  try {
    balances.BTC = await getBtcBalance(btcAddress);
    balances.SOL = await getSolanaBalance(solAddress);
    balances.DOGE = await getDogecoinBalance(dogeAddress);
    balances.DIANA = balances.SOL; // Assuming DIANA follows Solana balance logic
  } catch (error) {
    console.error('Error fetching balances:', error);
  }

  return balances;
};
