// src/utils/authUtils.ts
"use client";

import { signOut, getSession } from "next-auth/react";
import { getRefreshToken } from "@/utils/authTokens";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://dianagloballoginregister-52599bd07634.herokuapp.com";

/** Remove tudo do localStorage relacionado ao usuário atual. */
function clearLocalUserState(userId: string | null) {
  try {
    if (typeof window === "undefined") return;

    if (userId) {
      localStorage.removeItem(`btcAddress_${userId}`);
      localStorage.removeItem(`solAddress_${userId}`);
      localStorage.removeItem(`dogeAddress_${userId}`);
      localStorage.removeItem(`dianaAddress_${userId}`);
    }
    localStorage.removeItem("userId");
    localStorage.removeItem("name");

    // tokens “legados” caso tenha salvo localmente
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  } catch {
    /* ignore */
  }
}

/** Opcional: revoga o refresh token no backend (não bloqueia logout). */
async function revokeRefreshIfPossible() {
  try {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) return;

    await fetch(`${API_BASE}/api/v1/auth/revoke-refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // o endpoint do backend aceita apenas o token, sem Authorization
      body: JSON.stringify({ refreshToken }),
    }).catch(() => void 0);
  } catch {
    /* ignore */
  }
}

/** Sai da sessão (NextAuth + localStorage) e redireciona para / */
export const handleLogout = async () => {
  try {
    // tenta pegar userId antes de limpar sessão
    let userId: string | null = null;
    try {
      if (typeof window !== "undefined") {
        userId = localStorage.getItem("userId");
      }
      if (!userId) {
        const session = await getSession();
        userId =
          (session?.user as { id?: string; email?: string | null } | undefined)?.id ??
          (session?.user as { id?: string; email?: string | null } | undefined)?.email ??
          null;
      }
    } catch {
      /* ignore */
    }

    // revoga refresh token no backend (best-effort)
    await revokeRefreshIfPossible();

    // encerra sessão do NextAuth (sem redirecionar automático)
    await signOut({ redirect: false });

    // limpa tudo que é nosso no browser
    clearLocalUserState(userId);

    // vai para home
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  } catch {
    // fallback duro caso algo dê erro
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  }
};

/** Checa “login” de forma resiliente (NextAuth ou localStorage). */
export const isLogged = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    const userId = localStorage.getItem("userId");
    const access = localStorage.getItem("access_token");
    // basta ter userId OU access_token local, já que NextAuth é checado no server/middleware
    return Boolean(userId || access);
  } catch {
    return false;
  }
};
