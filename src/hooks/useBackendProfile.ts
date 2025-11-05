"use client";

import { useEffect, useState } from "react";
import { getAccessToken } from "@/utils/authTokens";

export type Profile = {
  id: string;
  name: string | null;
  email: string;
  authProvider?: string;   // "GOOGLE" | "LOCAL" etc.
  passwordSet?: boolean;   // true se o usuário já definiu senha local
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://dianagloballoginregister-52599bd07634.herokuapp.com";

export function useBackendProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setErr] = useState<string | null>(null);

  const fetchProfile = async (): Promise<Profile | null> => {
    try {
      const token = await getAccessToken();
      if (!token) {
        setErr("Missing access token");
        return null;
      }

      const res = await fetch(`${API_BASE}/api/v1/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        setErr("Unauthorized. Please sign in again.");
        return null;
      }

      if (!res.ok) {
        const ct = res.headers.get("content-type") || "";
        let msg = `Profile error: ${res.status}`;
        try {
          if (ct.includes("application/json")) {
            const j = await res.json();
            msg = j?.message || j?.detail || msg;
          } else {
            msg = (await res.text()) || msg;
          }
        } catch {}
        setErr(msg);
        return null;
      }

      const rawData = await res.json();
      // Mapear campos do backend para o formato esperado pelo frontend
      const mappedProfile: Profile = {
        id: rawData.id,
        name: rawData.name,
        email: rawData.email,
        authProvider: rawData.auth_provider || rawData.authProvider,
        passwordSet: rawData.password_set !== undefined ? rawData.password_set : rawData.passwordSet,
      };
      return mappedProfile;
    } catch (e: any) {
      setErr(e?.message || "Network error while loading profile");
      return null;
    }
  };

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setErr(null);
      const prof = await fetchProfile();
      if (!alive) return;
      if (prof) {
        setProfile(prof);
      }
      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, []);

  // Função para recarregar o perfil manualmente
  const reload = async () => {
    setLoading(true);
    setErr(null);
    const prof = await fetchProfile();
    if (prof) {
      setProfile(prof);
    }
    setLoading(false);
    return prof;
  };

  return { profile, loading, error, reload };
}
