import axios from 'axios';

const API_BASE_URL = 'https://solana-wallet-generator.onrender.com/api/addresses';

const checkAndSetAddress = async (
  key: string,
  userId: string,
  setAddress: (address: string) => void
) => {
  const storedAddress = localStorage.getItem(`${key}_${userId}`);
  if (storedAddress) {
    setAddress(storedAddress);
    console.log(`${key} Address (from storage):`, storedAddress);
    return storedAddress;
  }
  try {
    console.log(`Fetching ${key} address for userId:`, userId);
    const response = await axios.post(`${API_BASE_URL}/${key}`, { userId });
    const addressKey = `${key.toLowerCase()}Address`;
    const address = response.data[addressKey];
    if (address) {
      setAddress(address);
      localStorage.setItem(`${key}_${userId}`, address);
      console.log(`${key} Address:`, address);
      return address;
    } else {
      console.error(`Endereço ${key} não foi retornado!`);
      return null;
    }
  } catch (error) {
    console.error(`Error when searching for address ${key}:`, error);
    return null;
  }
};

export const fetchBtcAddress = (userId: string, setBtcAddress: (address: string) => void) =>
  checkAndSetAddress('btc', userId, setBtcAddress);

export const fetchSolAddress = (userId: string, setSolAddress: (address: string) => void) =>
  checkAndSetAddress('sol', userId, setSolAddress);

export const fetchDogeAddress = (userId: string, setDogeAddress: (address: string) => void) =>
  checkAndSetAddress('doge', userId, setDogeAddress);

export const fetchDianaAddress = (userId: string, setDianaAddress: (address: string) => void) =>
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
