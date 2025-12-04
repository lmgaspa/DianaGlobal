"use client";

import React from "react";

interface Props {
  provider?: string;
  passwordSet?: boolean;
}

const PasswordNotice: React.FC<Props> = ({ provider, passwordSet }) => {
  const isGoogle = (provider ?? "").toUpperCase() === "GOOGLE";
  const hasPassword = Boolean(passwordSet);

  // Se não tem provider definido, assumir Google sem senha (quando não há profile carregado)
  // Isso garante que o notice aparece mesmo quando o profile ainda não carregou
  const shouldShow = !provider || isGoogle;
  
  if (!shouldShow || hasPassword) return null;

  return (
    <div className="bg-red-50 border border-red-300 text-red-800 rounded-lg p-5 mb-6 max-w-2xl w-full text-center shadow-sm">
      <h3 className="font-semibold text-lg mb-2">⚠️ Set your password to unlock all features</h3>
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
        onClick={() => window.location.href = "/set-password"}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg transition-colors"
      >
        Set a new password
      </button>
    </div>
  );
};

export default PasswordNotice;
