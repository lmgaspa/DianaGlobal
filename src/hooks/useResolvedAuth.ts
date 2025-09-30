"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession, signOut } from "next-auth/react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://dianagloballoginregister-52599bd07634.herokuapp.com";

type Profile = { id: string; name: string | null; email: string };

function getLocalAccessToken(): string | undefined {
  try { return localStorage.getItem("access_token") ?? undefined; } catch { return undefined; }
}

function getSessionAccessToken(session: any): string | undefined {
  return (session as any)?.accessToken as string | undefined;
}

export function useResolvedAuth() {
  const { data: session, status } = useSession();

  const sessionToken = useMemo(() => getSessionAccessToken(session), [session]);
  const localToken   = useMemo(() => (typeof window !== "undefined" ? getLocalAccessToken() : undefined), []);

  // regra simples: prioriza NextAuth; se não houver, usa local
  const chosenToken  = sessionToken ?? localToken;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    if (!chosenToken) {
      setLoading(false);
      setProfile(null);
      return;
    }

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${chosenToken}` },
        });
        if (!res.ok) {
          if (res.status === 401) {
            try { await signOut({ redirect: false }); } catch {}
            setError("Session expired. Please sign in again.");
            setProfile(null);
          } else {
            const t = await res.text();
            throw new Error(t || `Error ${res.status}`);
          }
        } else {
          const p = (await res.json()) as Profile;
          setProfile(p);

          // atualiza os campos que seu useLocalStorage já lê
          try {
            localStorage.setItem("userId", p.id);
            if (p.name) localStorage.setItem("name", p.name);
          } catch {}
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load profile");
        setProfile(null);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, sessionToken]); // re-fetch se sessão NextAuth muda

  return { profile, loading, error };
}
