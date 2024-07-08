import axios from 'axios';

const checkAndSetAddress = async (key: string, userId: string, setAddress: (address: string) => void, apiEndpoint: string) => {
  const storedAddress = localStorage.getItem(`${key}_${userId}`);
  if (storedAddress) {
    setAddress(storedAddress);
    console.log(`${key} Address (from storage):`, storedAddress);
    return;
  }
  try {
    console.log(`Fetching ${key} address for userId:`, userId);
    const response = await axios.post(apiEndpoint, { userId });
    const addressKey = `${key.toLowerCase()}Address`;
    const address = response.data[addressKey];
    if (address) {
      setAddress(address);
      localStorage.setItem(`${key}_${userId}`, address);
      console.log(`${key} Address:`, address);
    } else {
      console.error(`Endereço ${key} não foi retornado.`);
    }
  } catch (error) {
    console.error(`Erro ao buscar endereço ${key}:`, error);
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
