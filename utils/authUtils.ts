import { signOut } from 'next-auth/react';

export const handleLogout = async () => {
  await signOut({ redirect: false });
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  console.log('Logging out, userId:', userId);
  if (userId) {
    localStorage.removeItem('userId');
    localStorage.removeItem('name');
    localStorage.removeItem(`btcAddress_${userId}`);
    localStorage.removeItem(`solAddress_${userId}`);
    localStorage.removeItem(`dogeAddress_${userId}`);
    localStorage.removeItem(`dianaAddress_${userId}`);
  }
  window.location.href = '/';
};

export const isLogged = (): boolean => {
  if (typeof window !== 'undefined') {
    const userId = localStorage.getItem('userId');
    console.log('Checking if user is logged in, userId:', userId);
    return !!userId;
  }
  return false;
};
