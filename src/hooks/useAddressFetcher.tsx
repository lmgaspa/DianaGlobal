"use client"
import { fetchAllUserAddresses } from '@/utils/tryGetCoins';
import { useEffect } from 'react';

export const useAddressFetcher = (userId: string | null, setBtcAddress: (address: string | null) => void, setSolAddress: (address: string | null) => void, setDogeAddress: (address: string | null) => void, setDianaAddress: (address: string | null) => void) => {
  useEffect(() => {
    if (userId) {
      fetchAllUserAddresses(userId, setBtcAddress, setSolAddress, setDogeAddress, setDianaAddress);
    }
  }, [userId]);
};
