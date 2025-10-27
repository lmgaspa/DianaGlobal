"use client";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useMemo } from "react";

type UserLike = { id?: string | null; name?: string | null } | undefined;

export function useSessionHandler(persist = false) {
  const { data: session, status } = useSession();
  const loading = status === "loading";

  const userId = useMemo(
    () => ((session?.user as UserLike)?.id ?? null),
    [session]
  );
  const name = useMemo(
    () => (session?.user?.name ?? null),
    [session]
  );

  // (Opcional) persistência leve: só se persist === true
  useEffect(() => {
    if (!persist || typeof window === "undefined") return;
    try {
      if (status === "authenticated" && userId && name) {
        localStorage.setItem("dg.userId", userId);
        localStorage.setItem("dg.name", name);
      } else if (status === "unauthenticated") {
        localStorage.removeItem("dg.userId");
        localStorage.removeItem("dg.name");
      }
    } catch {}
  }, [persist, status, userId, name]);

  // Evita signOut imediato se o NextAuth ainda não preencheu user.id/name
  useEffect(() => {
    if (status !== "authenticated") return;
    if (userId && name) return;

    const t = setTimeout(() => {
      // se depois do delay ainda não tem dados essenciais, faz signOut
      if (!userId || !name) signOut();
    }, 3000);

    return () => clearTimeout(t);
  }, [status, userId, name]);

  return { loading, userId, name };
}
