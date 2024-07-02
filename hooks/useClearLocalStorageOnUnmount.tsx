// src/hooks/useClearLocalStorageOnUnmount.ts

import { useEffect } from "react";

const useClearLocalStorageOnUnmount = () => {
  useEffect(() => {
    const clearLocalStorage = () => {
      localStorage.removeItem('userId');
      localStorage.removeItem('email');

      // Remove cookies específicos do NextAuth
      document.cookie = '__Secure-next-auth.csrf-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
      document.cookie = '__Secure-next-auth.callback-url=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
      document.cookie = '__Secure-next-auth.session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
    };

    window.addEventListener('beforeunload', clearLocalStorage);

    return () => {
      window.removeEventListener('beforeunload', clearLocalStorage);
      clearLocalStorage(); // Limpa imediatamente ao desmontar o componente
    };
  }, []);
};

export default useClearLocalStorageOnUnmount;
