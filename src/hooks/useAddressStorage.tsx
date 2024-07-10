"use client"
import { useEffect } from 'react';

export const useAddressStorage = (userId: string | null, btcAddress: string | null, solAddress: string | null, dogeAddress: string | null, dianaAddress: string | null) => {
  useEffect(() => {
    if (btcAddress) localStorage.setItem(`btcAddress_${userId}`, btcAddress);
    if (solAddress) localStorage.setItem(`solAddress_${userId}`, solAddress);
    if (dogeAddress) localStorage.setItem(`dogeAddress_${userId}`, dogeAddress);
    if (dianaAddress) localStorage.setItem(`dianaAddress_${userId}`, dianaAddress);
  }, [btcAddress, solAddress, dogeAddress, dianaAddress, userId]);
};
