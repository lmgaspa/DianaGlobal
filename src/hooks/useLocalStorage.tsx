// src/hooks/useLocalStorage.ts
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

function safeGet(key: string): string | null {
  try {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, val: string | null) {
  try {
    if (typeof window === "undefined") return;
    if (val === null) localStorage.removeItem(key);
    else localStorage.setItem(key, val);
  } catch {}
}

export const useLocalStorage = () => {
  const [storedUserId, setStoredUserIdState] = useState<string | null>(null);
  const [storedName, setStoredNameState] = useState<string | null>(null);

  const [btcAddress, setBtcAddress] = useState<string | null>(null);
  const [solAddress, setSolAddress] = useState<string | null>(null);
  const [dogeAddress, setDogeAddress] = useState<string | null>(null);
  const [dianaAddress, setDianaAddress] = useState<string | null>(null);

  // carrega userId/name na montagem
  useEffect(() => {
    const uid = safeGet("userId");
    const name = safeGet("name");
    setStoredUserIdState(uid);
    setStoredNameState(name);

    if (uid) {
      setBtcAddress(safeGet(`btcAddress_${uid}`));
      setSolAddress(safeGet(`solAddress_${uid}`));
      setDogeAddress(safeGet(`dogeAddress_${uid}`));
      setDianaAddress(safeGet(`dianaAddress_${uid}`));
    }
  }, []);

  // setters que persistem
  const setStoredUserId = useCallback((id: string | null) => {
    setStoredUserIdState(id);
    safeSet("userId", id);
    // quando trocamos de usuário, atualiza os endereços do novo dono
    if (id) {
      setBtcAddress(safeGet(`btcAddress_${id}`));
      setSolAddress(safeGet(`solAddress_${id}`));
      setDogeAddress(safeGet(`dogeAddress_${id}`));
      setDianaAddress(safeGet(`dianaAddress_${id}`));
    } else {
      setBtcAddress(null);
      setSolAddress(null);
      setDogeAddress(null);
      setDianaAddress(null);
    }
  }, []);

  const setStoredName = useCallback((name: string | null) => {
    setStoredNameState(name);
    safeSet("name", name);
  }, []);

  // Persistência de endereços: sempre gravados “keyed” pelo userId atual
  const keyedSetters = useMemo(() => {
    return {
      setBtcAddress: (val: string | null) => {
        setBtcAddress(val);
        if (storedUserId) safeSet(`btcAddress_${storedUserId}`, val);
      },
      setSolAddress: (val: string | null) => {
        setSolAddress(val);
        if (storedUserId) safeSet(`solAddress_${storedUserId}`, val);
      },
      setDogeAddress: (val: string | null) => {
        setDogeAddress(val);
        if (storedUserId) safeSet(`dogeAddress_${storedUserId}`, val);
      },
      setDianaAddress: (val: string | null) => {
        setDianaAddress(val);
        if (storedUserId) safeSet(`dianaAddress_${storedUserId}`, val);
      },
    };
  }, [storedUserId]);

  return {
    storedUserId,
    storedName,
    btcAddress,
    solAddress,
    dogeAddress,
    dianaAddress,
    ...keyedSetters,
    setStoredUserId,
    setStoredName,
  };
};
