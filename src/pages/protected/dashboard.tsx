// src/pages/protected/dashboard.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import WelcomeComponent from "@/components/DashboardComponents/WelcomeComponent";
import YourPortfolio from "@/components/DashboardComponents/YourPortfolio";
import EstimatedBalance from "@/components/DashboardComponents/EstimatedBalance";
import PasswordNotice from "@/components/DashboardComponents/PasswordNotice";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useSessionHandler } from "@/hooks/useSessionHandler";
import { useAddressStorage } from "@/hooks/useAddressStorage";
import { useAddressFetcher } from "@/hooks/useAddressFetcher";
import { useBackendProfile } from "@/hooks/useBackendProfile";

const Dashboard: React.FC = () => {
  // NextAuth handshake (ex.: evitar flicker e kicks)
  const { loading: sessionLoading } = useSessionHandler();

  // Perfil vindo do backend protegido (via access/refresh)
  const { profile, loading: profileLoading, error } = useBackendProfile();

  // Storage baseado em cookies (mantemos o nome do hook por compatibilidade)
  const {
    storedUserId,
    storedName,
    btcAddress,
    solAddress,
    dogeAddress,
    dianaAddress,
    setBtcAddress,
    setSolAddress,
    setDogeAddress,
    setDianaAddress,
    setStoredUserId,
    setStoredName,
  } = useLocalStorage();

  useEffect(() => {
  if (profile) console.log("[PROFILE]", profile);
}, [profile]);

  // Snapshot do backend → cookies (sem loop: setters idempotentes)
  useEffect(() => {
    if (profile?.id) setStoredUserId(profile.id);
  }, [profile?.id, setStoredUserId]);

  useEffect(() => {
    if (profile?.name !== undefined) setStoredName(profile?.name ?? null);
  }, [profile?.name, setStoredName]);

  const loading = sessionLoading || profileLoading;

  // `null` quando não houver userId — evita gravar cookies com "N/A"
  const effectiveUserId = useMemo<string | null>(
    () => profile?.id ?? storedUserId ?? null,
    [profile?.id, storedUserId]
  );

  const effectiveName = useMemo<string>(
    () => (profile?.name ?? storedName ?? "Guest"),
    [profile?.name, storedName]
  );

  // Persiste endereços no cookie (namespaced por userId) — só se tiver userId
  useEffect(() => {
    if (!effectiveUserId) return;
    // delegamos a persistência ao hook, que respeita SameSite/secure etc.
    // O hook já faz set/clear conforme valores; chamamos com os valores atuais.
    // (Como o hook usa useEffect internamente, podemos chamá-lo diretamente também.)
  }, [effectiveUserId, btcAddress, solAddress, dogeAddress, dianaAddress]);

  useAddressStorage(
    effectiveUserId,
    btcAddress,
    solAddress,
    dogeAddress,
    dianaAddress
  );

  // Busca endereços do backend quando há userId — evita chamadas desnecessárias
  useAddressFetcher(
    effectiveUserId || "",
    setBtcAddress,
    setSolAddress,
    setDogeAddress,
    setDianaAddress
  );

  const [showValues, setShowValues] = useState(false);

  return (
    <div className="flex flex-col min-h-screen dark:bg-black dark:text-white">
      <div className="flex-1 flex flex-col items-center p-4">
        <WelcomeComponent
          storedName={effectiveName}
          storedUserId={effectiveUserId ?? ""}
          loading={loading}
        />

        <PasswordNotice
          provider={profile?.authProvider}
          passwordSet={profile?.passwordSet}
        />

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <EstimatedBalance
          showValues={showValues}
          setShowValues={setShowValues}
          storedUserId={effectiveUserId ?? ""}
          storedName={effectiveName}
          btcAddress={btcAddress || ""}
          solAddress={solAddress || ""}
          dogeAddress={dogeAddress || ""}
          dianaAddress={dianaAddress || ""}
        />

        <YourPortfolio
          showValues={showValues}
          btcAddress={btcAddress || ""}
          solAddress={solAddress || ""}
          dogeAddress={dogeAddress || ""}
          dianaAddress={dianaAddress || ""}
        />
      </div>
    </div>
  );
};

export default Dashboard;
