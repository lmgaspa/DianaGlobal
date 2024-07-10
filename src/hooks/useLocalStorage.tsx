"use client"
import { useState, useEffect } from 'react';

export const useLocalStorage = () => {
  const [storedUserId, setStoredUserId] = useState<string | null>(null);
  const [storedName, setStoredName] = useState<string | null>(null);
  const [btcAddress, setBtcAddress] = useState<string | null>(null);
  const [solAddress, setSolAddress] = useState<string | null>(null);
  const [dogeAddress, setDogeAddress] = useState<string | null>(null);
  const [dianaAddress, setDianaAddress] = useState<string | null>(null);

  useEffect(() => {
    const loadFromLocalStorage = () => {
      const userId = localStorage.getItem('userId');
      const name = localStorage.getItem('name');
      const storedBtcAddress = localStorage.getItem(`btcAddress_${userId}`);
      const storedSolAddress = localStorage.getItem(`solAddress_${userId}`);
      const storedDogeAddress = localStorage.getItem(`dogeAddress_${userId}`);
      const storedDianaAddress = localStorage.getItem(`dianaAddress_${userId}`);

      if (userId && name) {
        setStoredUserId(userId);
        setStoredName(name);
        setBtcAddress(storedBtcAddress);
        setSolAddress(storedSolAddress);
        setDogeAddress(storedDogeAddress);
        setDianaAddress(storedDianaAddress);
      }
    };

    loadFromLocalStorage();
  }, []);

  return {
    storedUserId,
    storedName,
    btcAddress,
    solAddress,
    dogeAddress,
    dianaAddress,
    setBtcAddress,
    setSolAddress,
    setDogeAddress,
    setDianaAddress
  };
};
