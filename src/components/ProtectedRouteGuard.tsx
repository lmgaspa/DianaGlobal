"use client";

import React from "react";
import { useRouter } from "next/router";
import PasswordRequiredGate from "@/components/PasswordRequiredGate";

/**
 * Lista de rotas protegidas que NÃO devem ter bloqueio de senha
 * (ex: dashboard, set-password, etc)
 */
const EXCLUDED_ROUTES = [
  "/protected/dashboard",
  "/protected/login", // se existir
  "/set-password", // pode estar fora de /protected
];

/**
 * Guard global que aplica PasswordRequiredGate automaticamente
 * em todas as rotas /protected/*, exceto as listadas em EXCLUDED_ROUTES
 */
interface ProtectedRouteGuardProps {
  children: React.ReactNode;
}

const ProtectedRouteGuard: React.FC<ProtectedRouteGuardProps> = ({ children }) => {
  const router = useRouter();
  const pathname = router.pathname;

  // Verificar se é uma rota protegida
  const isProtectedRoute = pathname.startsWith("/protected/");
  
  // Verificar se está na lista de exceções
  const isExcluded = EXCLUDED_ROUTES.some(route => pathname === route);

  // Se não for rota protegida ou estiver excluída, renderizar normalmente
  if (!isProtectedRoute || isExcluded) {
    return <>{children}</>;
  }

  // Aplicar PasswordRequiredGate automaticamente
  return <PasswordRequiredGate>{children}</PasswordRequiredGate>;
};

export default ProtectedRouteGuard;

