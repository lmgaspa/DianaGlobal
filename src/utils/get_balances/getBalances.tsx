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
    if (btcAddress) {
      console.log('Fetching balance for BTC address:', btcAddress);
      balances.BTC = await getBtcBalance(btcAddress);
    } else {
      console.warn('BTC address is required');
    }

    if (solAddress) {
      console.log('Fetching balance for SOL address:', solAddress);
      balances.SOL = await getSolanaBalance(solAddress);
    } else {
      console.warn('SOL address is required');
    }

    if (dogeAddress) {
      console.log('Fetching balance for DOGE address:', dogeAddress);
      balances.DOGE = await getDogecoinBalance(dogeAddress);
    } else {
      console.warn('DOGE address is required');
    }

    if (dianaAddress) {
      console.log('Fetching balance for DIANA address:', dianaAddress);
      balances.DIANA = balances.SOL;
    } else {
      console.warn('DIANA address is required');
    }
  } catch (error) {
    console.error('Error fetching balances:', error);
  }

  return balances;
};

(async () => {
  const btcAddress = 'DE5opaXjFgDhFBqL6tBDxTAQ56zkX6EToX';
  const solAddress = '52C9T2T7JRojtxumYnYZhyUmrN7kqzvCLc4Ksvjk7TxD';
  const dogeAddress = 'DGmzv39riELTuigZCUD6sWoHEHPdSbxdUB';
  const dianaAddress = 'AKaJEbYh4nknfg657NBMF6STz2VXe3qFNYsRkrL5cg3j'; 

  const balances = await fetchBalances(btcAddress, solAddress, dogeAddress, dianaAddress);
  console.log('Fetched balances:', balances);
})();
