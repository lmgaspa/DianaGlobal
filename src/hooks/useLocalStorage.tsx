// src/hooks/useLocalStorage.ts
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

/* =========================
   Cookie helpers (client)
   ========================= */
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

function setCookie(
  name: string,
  value: string | null,
  days = 365,
  opts: { path?: string; sameSite?: "Lax" | "Strict" | "None"; secure?: boolean } = {}
) {
  if (typeof document === "undefined") return;
  const path = opts.path ?? "/";
  const sameSite = opts.sameSite ?? "Lax";
  const secure = opts.secure ?? (typeof location !== "undefined" && location.protocol === "https:");

  if (value === null) {
    // delete cookie
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path};SameSite=${sameSite}${
      secure ? ";Secure" : ""
    }`;
    return;
  }
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(
    value
  )};expires=${d.toUTCString()};path=${path};SameSite=${sameSite}${secure ? ";Secure" : ""}`;
}

/* =========================
   (Legacy) localStorage helpers
   ========================= */
function lsGet(key: string): string | null {
  try {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function lsSet(key: string, val: string | null) {
  try {
    if (typeof window === "undefined") return;
    if (val === null) localStorage.removeItem(key);
    else localStorage.setItem(key, val);
  } catch {}
}

/* =========================
   Hook público (API compatível)
   =========================
   - Agora usa COOKIES como storage principal
   - Faz MIGRAÇÃO automática do legado em localStorage
   - Namespacing de cookies:
     dg.userId, dg.name
     dg.addr.btc.<userId>, dg.addr.sol.<userId>, dg.addr.doge.<userId>, dg.addr.diana.<userId>
*/
export const useLocalStorage = () => {
  const [storedUserId, setStoredUserIdState] = useState<string | null>(null);
  const [storedName, setStoredNameState] = useState<string | null>(null);

  const [btcAddress, setBtcAddressState] = useState<string | null>(null);
  const [solAddress, setSolAddressState] = useState<string | null>(null);
  const [dogeAddress, setDogeAddressState] = useState<string | null>(null);
  const [dianaAddress, setDianaAddressState] = useState<string | null>(null);

  // Carrega na montagem (cookies primeiro; se não houver, migra do legado em localStorage)
  useEffect(() => {
    // 1) Usuário
    let uid = getCookie("dg.userId");
    let name = getCookie("dg.name");

    // migração do legado se necessário
    if (!uid) {
      const legacyUid = lsGet("userId");
      if (legacyUid) {
        uid = legacyUid;
        setCookie("dg.userId", legacyUid);
        lsSet("userId", null);
      }
    }
    if (!name) {
      const legacyName = lsGet("name");
      if (legacyName) {
        name = legacyName;
        setCookie("dg.name", legacyName);
        lsSet("name", null);
      }
    }

    setStoredUserIdState(uid ?? null);
    setStoredNameState(name ?? null);

    // 2) Endereços (dependem de userId)
    const loadAddresses = (u: string | null) => {
      if (!u) {
        setBtcAddressState(null);
        setSolAddressState(null);
        setDogeAddressState(null);
        setDianaAddressState(null);
        return;
      }
      const key = (sym: string) => `dg.addr.${sym}.${u}`;

      let btc = getCookie(key("btc"));
      let sol = getCookie(key("sol"));
      let doge = getCookie(key("doge"));
      let diana = getCookie(key("diana"));

      // migração do legado (keyed por localStorage: <sym>Address_<uid>)
      if (!btc) {
        const legacy = lsGet(`btcAddress_${u}`);
        if (legacy) {
          btc = legacy;
          setCookie(key("btc"), legacy);
          lsSet(`btcAddress_${u}`, null);
        }
      }
      if (!sol) {
        const legacy = lsGet(`solAddress_${u}`);
        if (legacy) {
          sol = legacy;
          setCookie(key("sol"), legacy);
          lsSet(`solAddress_${u}`, null);
        }
      }
      if (!doge) {
        const legacy = lsGet(`dogeAddress_${u}`);
        if (legacy) {
          doge = legacy;
          setCookie(key("doge"), legacy);
          lsSet(`dogeAddress_${u}`, null);
        }
      }
      if (!diana) {
        const legacy = lsGet(`dianaAddress_${u}`);
        if (legacy) {
          diana = legacy;
          setCookie(key("diana"), legacy);
          lsSet(`dianaAddress_${u}`, null);
        }
      }

      setBtcAddressState(btc ?? null);
      setSolAddressState(sol ?? null);
      setDogeAddressState(doge ?? null);
      setDianaAddressState(diana ?? null);
    };

    loadAddresses(uid);
  }, []);

  // Ao trocar de usuário, recarrega endereços daquele usuário
  const setStoredUserId = useCallback((id: string | null) => {
    setStoredUserIdState(id);
    setCookie("dg.userId", id);
    if (id) {
      const key = (sym: string) => `dg.addr.${sym}.${id}`;
      setBtcAddressState(getCookie(key("btc")));
      setSolAddressState(getCookie(key("sol")));
      setDogeAddressState(getCookie(key("doge")));
      setDianaAddressState(getCookie(key("diana")));
    } else {
      setBtcAddressState(null);
      setSolAddressState(null);
      setDogeAddressState(null);
      setDianaAddressState(null);
    }
  }, []);

  const setStoredName = useCallback((name: string | null) => {
    setStoredNameState(name);
    setCookie("dg.name", name);
  }, []);

  // setters de endereços com chave por userId
  const keyedSetters = useMemo(() => {
    return {
      setBtcAddress: (val: string | null) => {
        setBtcAddressState(val);
        if (storedUserId) setCookie(`dg.addr.btc.${storedUserId}`, val);
      },
      setSolAddress: (val: string | null) => {
        setSolAddressState(val);
        if (storedUserId) setCookie(`dg.addr.sol.${storedUserId}`, val);
      },
      setDogeAddress: (val: string | null) => {
        setDogeAddressState(val);
        if (storedUserId) setCookie(`dg.addr.doge.${storedUserId}`, val);
      },
      setDianaAddress: (val: string | null) => {
        setDianaAddressState(val);
        if (storedUserId) setCookie(`dg.addr.diana.${storedUserId}`, val);
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
