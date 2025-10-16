// src/api/addresses.ts
import axios from "axios";
import { getCookie, setCookie } from "@/utils/cookies";

type Coin = "btc" | "sol" | "doge" | "diana";

// Base da API (pode sobrescrever via env)
const API_BASE =
  process.env.NEXT_PUBLIC_WALLET_API_BASE ??
  "https://solana-wallet-generator.onrender.com/api/addresses";

// Nome do cookie: dg.addr.<coin>.<userId>
const addrCookie = (coin: Coin, userId: string) => `dg.addr.${coin}.${userId}`;

const readCached = (coin: Coin, userId: string): string | null =>
  getCookie(addrCookie(coin, userId));

const writeCached = (coin: Coin, userId: string, value: string) => {
  setCookie(addrCookie(coin, userId), value, 365, {
    sameSite: "Lax",
    secure: typeof location !== "undefined" && location.protocol === "https:",
  });
};

const checkAndSetAddress = async (
  key: Coin,
  userId: string,
  setAddress: (address: string) => void
): Promise<string | null> => {
  if (!userId) {
    console.error(`[${key}] missing userId`);
    return null;
  }

  // 1) cache via cookie
  const cached = readCached(key, userId);
  if (cached) {
    setAddress(cached);
    // console.debug(`[${key}] address (from cookie):`, cached);
    return cached;
  }

  // 2) busca na API e persiste em cookie
  try {
    // console.debug(`Fetching ${key} address for userId:`, userId);
    const { data } = await axios.post(`${API_BASE}/${key}`, { userId });
    const prop = `${key}Address` as const; // ex.: "btcAddress"
    const address = data?.[prop];

    if (typeof address === "string" && address.trim().length > 0) {
      setAddress(address);
      writeCached(key, userId, address.trim());
      return address.trim();
    }

    console.error(`Address for ${key} was not returned by API.`);
    return null;
  } catch (e) {
    console.error(`[${key}] request failed`, e);
    return null;
  }
};

// ===== exports práticos (assinaturas preservadas) =====
export const fetchBtcAddress = (userId: string, setBtcAddress: (a: string) => void) =>
  checkAndSetAddress("btc", userId, setBtcAddress);

export const fetchSolAddress = (userId: string, setSolAddress: (a: string) => void) =>
  checkAndSetAddress("sol", userId, setSolAddress);

export const fetchDogeAddress = (userId: string, setDogeAddress: (a: string) => void) =>
  checkAndSetAddress("doge", userId, setDogeAddress);

export const fetchDianaAddress = (userId: string, setDianaAddress: (a: string) => void) =>
  checkAndSetAddress("diana", userId, setDianaAddress);

export const fetchAllUserAddresses = async (
  userId: string,
  setBtcAddress: (a: string) => void,
  setSolAddress: (a: string) => void,
  setDogeAddress: (a: string) => void,
  setDianaAddress: (a: string) => void
) => {
  await Promise.allSettled([
    checkAndSetAddress("btc", userId, setBtcAddress),
    checkAndSetAddress("sol", userId, setSolAddress),
    checkAndSetAddress("doge", userId, setDogeAddress),
    checkAndSetAddress("diana", userId, setDianaAddress),
  ]);
};
