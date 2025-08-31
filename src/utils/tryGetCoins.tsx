// api/addresses.ts
import axios from 'axios';

const API_BASE = 'https://solana-wallet-generator.onrender.com/api/addresses';

type Coin = 'btc' | 'sol' | 'doge' | 'diana';

const checkAndSetAddress = async (
  key: Coin,
  userId: string,
  setAddress: (address: string) => void
): Promise<string | null> => {
  const stored = localStorage.getItem(`${key}_${userId}`);
  if (stored) {
    setAddress(stored);
    console.log(`${key} Address (from storage):`, stored);
    return stored;
  }

  try {
    console.log(`Fetching ${key} address for userId:`, userId);
    const { data } = await axios.post(`${API_BASE}/${key}`, { userId }); // nova rota
    const address = data[`${key}Address`];
    if (address) {
      setAddress(address);
      localStorage.setItem(`${key}_${userId}`, address);
      return address;
    }
    console.error(`Endereço ${key} não foi retornado!`);
    return null;
  } catch (e) {
    console.error(`[${key}] request failed`, e);
    return null;
  }
};

// exports práticos
export const fetchBtcAddress = (userId: string, setBtcAddress: (a: string) => void) =>
  checkAndSetAddress('btc', userId, setBtcAddress);

export const fetchSolAddress = (userId: string, setSolAddress: (a: string) => void) =>
  checkAndSetAddress('sol', userId, setSolAddress);

export const fetchDogeAddress = (userId: string, setDogeAddress: (a: string) => void) =>
  checkAndSetAddress('doge', userId, setDogeAddress);

export const fetchDianaAddress = (userId: string, setDianaAddress: (a: string) => void) =>
  checkAndSetAddress('diana', userId, setDianaAddress);

export const fetchAllUserAddresses = async (
  userId: string,
  setBtcAddress: (a: string) => void,
  setSolAddress: (a: string) => void,
  setDogeAddress: (a: string) => void,
  setDianaAddress: (a: string) => void
) => {
  await Promise.allSettled([
    checkAndSetAddress('btc', userId, setBtcAddress),
    checkAndSetAddress('sol', userId, setSolAddress),
    checkAndSetAddress('doge', userId, setDogeAddress),
    checkAndSetAddress('diana', userId, setDianaAddress),
  ]);
};

/* better now! */