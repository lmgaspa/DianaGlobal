"use client";

import React from "react";
import { useRouter } from "next/router";
import { useBackendProfile } from "@/hooks/useBackendProfile";
import { useSession } from "next-auth/react";

interface PasswordRequiredGateProps {
  children: React.ReactNode;
}

/**
 * Component that blocks access to protected routes if user doesn't have a password set.
 * Shows a message similar to the PasswordNotice component.
 */
const PasswordRequiredGate: React.FC<PasswordRequiredGateProps> = ({ children }) => {
  const router = useRouter();
  const { profile, loading } = useBackendProfile();
  const { data: session } = useSession();
  
  // Tentar obter email da sessão ou do profile para passar para set-password
  const userEmail = session?.user?.email || profile?.email || null;

  // Não redirecionar automaticamente - sempre bloquear se necessário
  // Deixa o middleware lidar com redirecionamento se não deveria estar aqui

  // Wait for profile to load
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Se não houver profile ainda, verificar se deve bloquear
  if (!profile) {
    // Se ainda está carregando, mostrar loading
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">Loading...</p>
          </div>
        </div>
      );
    }
    
    // Se terminou de carregar mas não tem profile:
    // SEMPRE bloquear (assumir Google user sem senha que precisa setar senha)
    // Mesmo se não tem sessão válida OU se tem erro 401, bloquear
    // Isso garante que mesmo tentando burlar (acessar rota protegida diretamente),
    // o usuário será bloqueado e forçado a setar senha
    // A mesma lógica do "Continue with Google" funciona porque cria sessão válida
    // Mas aqui, mesmo sem sessão, bloqueamos por segurança
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-black px-4">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md w-full max-w-md">
          <div className="bg-red-50 border border-red-300 text-red-800 rounded-lg p-5 mb-4 text-center shadow-sm">
            <h3 className="font-semibold text-lg mb-2">⚠️ Set your password to access this feature</h3>
            <p className="text-sm mb-3">
              Your account was created using Google. Your email is already verified ✅,
              but you haven&apos;t set a password yet.
            </p>
            <div className="bg-red-100 border border-red-200 rounded p-3 mb-4 text-left">
              <p className="text-sm font-semibold mb-2">🚫 Suspended functions:</p>
              <ul className="text-xs space-y-1 list-disc list-inside">
                <li>Deposit</li>
                <li>Withdraw</li>
                <li>Buy with Money</li>
                <li>Swap</li>
              </ul>
              <p className="text-xs mt-2 text-red-700">
                These features will be available after you set a password.
              </p>
            </div>
            <button
              onClick={() => {
                // Passar email como query parameter se disponível, para evitar redirecionamento no set-password
                const url = userEmail ? `/set-password?email=${encodeURIComponent(userEmail)}` : "/set-password";
                router.push(url);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors mb-3 w-full"
            >
              Set a new password
            </button>
            <button
              onClick={() => router.push("/protected/dashboard")}
              className="text-blue-600 hover:underline text-sm px-4 py-2"
            >
              Go back to dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Profile carregou - verificar se precisa bloquear
  const isGoogle = (profile.authProvider ?? "").toUpperCase() === "GOOGLE";
  const hasPassword = Boolean(profile.passwordSet);
  // Se profile existe mas authProvider/passwordSet são undefined, assumir Google sem senha (backend não retornou os campos)
  const profileMissingFields = profile.authProvider === undefined && profile.passwordSet === undefined;

  if ((isGoogle && !hasPassword) || profileMissingFields) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-black px-4">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md w-full max-w-md">
          <div className="bg-red-50 border border-red-300 text-red-800 rounded-lg p-5 mb-4 text-center shadow-sm">
            <h3 className="font-semibold text-lg mb-2">⚠️ Set your password to access this feature</h3>
            <p className="text-sm mb-3">
              Your account was created using Google. Your email is already verified ✅,
              but you haven&apos;t set a password yet.
            </p>
            <div className="bg-red-100 border border-red-200 rounded p-3 mb-4 text-left">
              <p className="text-sm font-semibold mb-2">🚫 Suspended functions:</p>
              <ul className="text-xs space-y-1 list-disc list-inside">
                <li>Deposit</li>
                <li>Withdraw</li>
                <li>Buy with Money</li>
                <li>Swap</li>
              </ul>
              <p className="text-xs mt-2 text-red-700">
                These features will be available after you set a password.
              </p>
            </div>
            <button
              onClick={() => {
                // Passar email como query parameter se disponível, para evitar redirecionamento no set-password
                const url = userEmail ? `/set-password?email=${encodeURIComponent(userEmail)}` : "/set-password";
                router.push(url);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors mb-3 w-full"
            >
              Set a new password
            </button>
            <button
              onClick={() => router.push("/protected/dashboard")}
              className="text-blue-600 hover:underline text-sm px-4 py-2"
            >
              Go back to dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User has password or is not Google user, allow access
  return <>{children}</>;
};

export default PasswordRequiredGate;

