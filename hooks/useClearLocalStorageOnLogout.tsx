// useClearLocalStorageOnLogout.tsx
import { useEffect } from "react";

const useClearLocalStorageOnLogout = (handleLogout: () => void) => {
  useEffect(() => {
    const clearLocalStorage = () => {
      localStorage.removeItem('userId');
      localStorage.removeItem('email');
      document.cookie = '__Secure-next-auth.csrf-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
      document.cookie = '__Secure-next-auth.callback-url=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
      document.cookie = '__Secure-next-auth.session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
    };

    window.addEventListener('beforeunload', clearLocalStorage);

    return () => {
      window.removeEventListener('beforeunload', clearLocalStorage);
      clearLocalStorage(); // Limpa imediatamente ao desmontar o componente
    };
  }, [handleLogout]);
};

export default useClearLocalStorageOnLogout;

