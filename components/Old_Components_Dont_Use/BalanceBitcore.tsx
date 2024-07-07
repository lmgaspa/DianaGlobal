/*

"use client";
import React, { useState, useEffect } from "react";

interface BalanceBitcoreProps {
  btcAddress: string | null;
  solAddress: string | null;
  dogeAddress: string | null;
  dianaAddress: string | null;
}

const BalanceBitcore: React.FC<BalanceBitcoreProps> = ({ btcAddress, solAddress, dogeAddress, dianaAddress }) => {


  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h2 className="text-1xl font-bold mb-4">Estimated Balance</h2>
      <h1 className="text-sm font-bold mb-2">BTC Address: {btcAddress ? btcAddress : 'Loading...'}</h1>
      <h1 className="text-sm font-bold mb-2">Solana Address: {solAddress ? solAddress : 'Loading...'}</h1>
      <h1 className="text-sm font-bold mb-2">DogeCoin Address: {dogeAddress ? dogeAddress : 'Loading...'}</h1>
      <h1 className="text-sm font-bold mb-2">Diana Coin Address: {dianaAddress ? dianaAddress : 'Loading...'}</h1>
    </div>
  );
};

export default BalanceBitcore;

*/