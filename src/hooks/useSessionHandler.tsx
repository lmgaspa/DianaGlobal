"use client"
import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';

export const useSessionHandler = () => {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      const { id, name } = session?.user || {};
      if (id && name) {
        localStorage.setItem('userId', id);
        localStorage.setItem('name', name);
        setUserId(id);
        setName(name);
        setLoading(false);
      } else {
        signOut();
      }
    } else {
      setLoading(false);
    }
  }, [session, status]);

  return {
    loading,
    userId,
    name,
  };
};
