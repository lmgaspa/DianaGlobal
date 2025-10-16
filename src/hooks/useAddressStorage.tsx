// src/hooks/useAddressStorage.ts
"use client";

import { useEffect } from "react";
import { setCookie } from "@/utils/cookies";

/**
 * Armazena endereços por usuário em cookies de primeira parte.
 * - Chaves: dg.addr.<symbol>.<userId>
 * - Cookies: SameSite=Lax; Secure (em HTTPS)
 * - TTL padrão: 365 dias
 *
 * Observações:
 * - Cookies têm limite de ~4 KB por cookie e ~50 cookies por domínio — endereços de cripto são curtos, então ok.
 * - Se quiser apagar um endereço, passe null/undefined (o hook limpa o cookie).
 */

type MaybeString = string | null | undefined;

function deleteCookie(name: string) {
  // expira imediatamente
  setCookie(name, "", -1, { sameSite: "Lax", secure: typeof location !== "undefined" && location.protocol === "https:" });
}

function setOrClearCookie(name: string, value: MaybeString) {
  const isHttps = typeof location !== "undefined" && location.protocol === "https:";
  if (value && value.trim().length > 0) {
    setCookie(name, value.trim(), 365, { sameSite: "Lax", secure: isHttps });
  } else {
    deleteCookie(name);
  }
}

export function useAddressStorage(
  userId: string | null,
  btcAddress: MaybeString,
  solAddress: MaybeString,
  dogeAddress: MaybeString,
  dianaAddress: MaybeString
) {
  useEffect(() => {
    // sem userId não persiste nada
    if (!userId) return;

    // nomes de cookies (namespaced)
    const key = (sym: string) => `dg.addr.${sym}.${userId}`;

    setOrClearCookie(key("btc"), btcAddress);
    setOrClearCookie(key("sol"), solAddress);
    setOrClearCookie(key("doge"), dogeAddress);
    setOrClearCookie(key("diana"), dianaAddress);
  }, [userId, btcAddress, solAddress, dogeAddress, dianaAddress]);
}

export default useAddressStorage;
