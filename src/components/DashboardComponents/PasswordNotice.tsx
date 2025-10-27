"use client";

import React from "react";

interface Props {
  provider?: string;
  passwordSet?: boolean;
}

const PasswordNotice: React.FC<Props> = ({ provider, passwordSet }) => {
  const isGoogle = (provider ?? "").toUpperCase() === "GOOGLE";
  const hasPassword = Boolean(passwordSet);

  if (!isGoogle || hasPassword) return null;

  return (
    <div className="bg-blue-50 border border-blue-300 text-blue-800 rounded-lg p-5 mb-6 max-w-2xl w-full text-center shadow-sm">
      <h3 className="font-semibold text-lg mb-2">Set your password</h3>
      <p className="text-sm mb-4">
        Your account was created using Google. Your email is already verified ✅,
        but you haven't set a password yet. You can create one now to also sign in using email and password.
      </p>
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
