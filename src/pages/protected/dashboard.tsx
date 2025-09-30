"use client";

import React, { useMemo, useState } from "react";
import WelcomeComponent from "@/components/DashboardComponents/WelcomeComponent";
import YourPortfolio from "@/components/DashboardComponents/YourPortfolio";
import EstimatedBalance from "@/components/DashboardComponents/EstimatedBalance";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useSessionHandler } from "@/hooks/useSessionHandler";
import { useAddressStorage } from "@/hooks/useAddressStorage";
import { useAddressFetcher } from "@/hooks/useAddressFetcher";
import { useResolvedAuth } from "@/hooks/useResolvedAuth"; // novo

const Dashboard: React.FC = () => {
  const { loading: sessionLoading } = useSessionHandler();
  const { profile, loading: authLoading, error } = useResolvedAuth();

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
  } = useLocalStorage();

  const loading = sessionLoading || authLoading;

  // Decide o que mostrar (perfil mais atual > localStorage > fallback)
  const effectiveUserId = useMemo(
    () => profile?.id || storedUserId || "N/A",
    [profile?.id, storedUserId]
  );
  const effectiveName = useMemo(
    () => (profile?.name ?? storedName) || "Guest",
    [profile?.name, storedName]
  );

  // mantém endereços “keyed” pelo userId efetivo
  useAddressStorage(effectiveUserId, btcAddress, solAddress, dogeAddress, dianaAddress);
  useAddressFetcher(effectiveUserId, setBtcAddress, setSolAddress, setDogeAddress, setDianaAddress);

  const [showValues, setShowValues] = useState(false);

  return (
    <div className="flex flex-col min-h-screen dark:bg-black dark:text-white">
      <div className="flex-1 flex flex-col items-center p-4">
        <WelcomeComponent
          storedName={effectiveName}
          storedUserId={effectiveUserId}
          loading={loading}
        />

        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}

        <EstimatedBalance
          showValues={showValues}
          setShowValues={setShowValues}
          storedUserId={effectiveUserId}
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
