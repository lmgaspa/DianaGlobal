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
import { useRouter } from "next/router";
import SettingsPanel from "@/components/OtherComponents/SettingsPanel";

const Dashboard: React.FC = () => {
  const router = useRouter();
  
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

  const loading = sessionLoading || profileLoading;

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
    <div className="flex min-h-screen flex-col dark:bg-black dark:text-white">
      <div className="flex flex-1 flex-col items-center p-4">
        <WelcomeComponent
          storedName={effectiveName}
          storedUserId={effectiveUserId ?? ""}
          loading={loading}
        />

        <PasswordNotice
          provider={profile?.authProvider}
          passwordSet={profile?.passwordSet}
        />

        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

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

      {/* Floating Settings on the right */}
      <SettingsPanel />
    </div>
  );
};

export default Dashboard;