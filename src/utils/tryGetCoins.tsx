// (arquivo atual do frontend onde estão os métodos de endereço)
import axios from 'axios';
import {
  rumWalletRequest,
  rumCacheEvent,
  rumPhaseParallel,
  rumFlowTotal,
  rumBlockedByBTC,
} from '../utils/rum';

const checkAndSetAddress = async (
  key: string,
  userId: string,
  setAddress: (address: string) => void,
  apiEndpoint: string
) => {
  const storedAddress = localStorage.getItem(`${key}_${userId}`);
  if (storedAddress) {
    setAddress(storedAddress);
    console.log(`${key} Address (from storage):`, storedAddress);
    rumCacheEvent({ currency: key, hit: true });
    // Opcional: registre uma latência quase zero para UX quente
    rumWalletRequest({ currency: key, cache: "hit", result: "success", durationMs: 0.5 });
    return storedAddress;
  }

  rumCacheEvent({ currency: key, hit: false });
  try {
    console.log(`Fetching ${key} address for userId:`, userId);
    const t0 = performance.now();
    const response = await axios.post(apiEndpoint, { userId });
    const t1 = performance.now();

    const addressKey = `${key.toLowerCase()}Address`;
    const address = response.data[addressKey];
    if (address) {
      setAddress(address);
      localStorage.setItem(`${key}_${userId}`, address);
      console.log(`${key} Address:`, address);

      rumWalletRequest({
        currency: key,
        cache: "miss",
        result: "success",
        durationMs: t1 - t0,
      });
      return address;
    } else {
      console.error(`Endereço ${key} não foi retornado!`);
      rumWalletRequest({
        currency: key,
        cache: "miss",
        result: "error",
        durationMs: t1 - t0,
        errorType: "no_address_in_payload",
      });
      return null;
    }
  } catch (error: any) {
    const dur = 0; // se falhar antes de t1, mantenha 0 ou meça até o catch
    console.error(`Error when searching for address ${key}:`, error);
    rumWalletRequest({
      currency: key,
      cache: "miss",
      result: "error",
      durationMs: dur,
      errorType: error?.code || error?.message || "unknown",
    });
    return null;
  }
};

const fetchAllAddresses = async (
  userId: string,
  setBtcAddress: (address: string) => void,
  setSolAddress: (address: string) => void,
  setDogeAddress: (address: string) => void,
  setDianaAddress: (address: string) => void
) => {
  const T0_total = performance.now();

  const btcAddress = await checkAndSetAddress(
    'btc',
    userId,
    setBtcAddress,
    'https://solana-wallet-generator.onrender.com/api/create_btc_address'
  );

  if (btcAddress) {
    const T0_parallel = performance.now();
    const results = await Promise.allSettled([
      checkAndSetAddress('sol', userId, setSolAddress, 'https://solana-wallet-generator.onrender.com/api/create_sol_address'),
      checkAndSetAddress('doge', userId, setDogeAddress, 'https://solana-wallet-generator.onrender.com/api/create_doge_address'),
      checkAndSetAddress('diana', userId, setDianaAddress, 'https://solana-wallet-generator.onrender.com/api/create_diana_address')
    ]);
    const T1_parallel = performance.now();
    rumPhaseParallel(T1_parallel - T0_parallel);

    const T1_total = T1_parallel; // todas prontas no fim da fase paralela
    rumFlowTotal(T1_total - T0_total);

    return results;
  } else {
    console.error('Não foi possível obter o endereço BTC. Não serão feitas outras tentativas.');
    rumBlockedByBTC();
    // também feche a métrica de fluxo total como “abortado” se quiser (opcional)
    return null;
  }
};

export const fetchBtcAddress = async (userId: string, setBtcAddress: (address: string) => void) => {
  await checkAndSetAddress('btc', userId, setBtcAddress, 'https://solana-wallet-generator.onrender.com/api/create_btc_address');
};

export const fetchSolAddress = async (userId: string, setSolAddress: (address: string) => void) => {
  await checkAndSetAddress('sol', userId, setSolAddress, 'https://solana-wallet-generator.onrender.com/api/create_sol_address');
};

export const fetchDogeAddress = async (userId: string, setDogeAddress: (address: string) => void) => {
  await checkAndSetAddress('doge', userId, setDogeAddress, 'https://solana-wallet-generator.onrender.com/api/create_doge_address');
};

export const fetchDianaAddress = async (userId: string, setDianaAddress: (address: string) => void) => {
  await checkAndSetAddress('diana', userId, setDianaAddress, 'https://solana-wallet-generator.onrender.com/api/create_diana_address');
};

export const fetchAllUserAddresses = fetchAllAddresses;
