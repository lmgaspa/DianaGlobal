// utils/authUtils.ts
import { signOut } from 'next-auth/react';

export const handleLogout = async () => {
  await signOut({ redirect: false });
  localStorage.removeItem('userId');
  localStorage.removeItem('name');
  const userId = localStorage.getItem('userId');
  localStorage.removeItem(`btcAddress_${userId}`);
  localStorage.removeItem(`solAddress_${userId}`);
  localStorage.removeItem(`dogeAddress_${userId}`);
  localStorage.removeItem(`dianaAddress_${userId}`);
  window.location.href = '/'; // Redirecionar para a página inicial
};
