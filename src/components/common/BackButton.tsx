// src/components/common/BackButton.tsx
"use client";

import React from "react";
import { useRouter } from "next/router";

type Props = {
  /** Destination route, e.g. "/protected/dashboard" */
  to: string;
  /** Visible label next to the arrow */
  text?: string;
  /** If true, renders fixed at top-left; otherwise renders inline */
  fixed?: boolean;
  /** Custom position: 'top-left' | 'above-box' */
  position?: 'top-left' | 'above-box';
  /** Extra Tailwind classes to override/extend styles */
  className?: string;
  /** Optional callback before navigation */
  onBeforeNavigate?: () => void;
};

export default function BackButton({
  to,
  text = "Back do Dashboard",
  fixed = true,
  position = 'top-left',
  className = "",
  onBeforeNavigate,
}: Props) {
  const router = useRouter();

  const base = [
  "inline-flex items-center gap-2 rounded-lg shadow-sm",
  "border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium",
  "hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700 transition-all duration-200",
  "active:scale-98 cursor-pointer",
  "dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200",
  "dark:hover:bg-zinc-700 dark:hover:border-blue-500 dark:hover:text-blue-300",
].join(" ");

  const positionClass = fixed ? 
    (position === 'above-box' ? 
      "fixed left-1/2 -translate-x-1/2 top-20 z-40" : 
      "fixed left-4 top-20 z-40"
    ) : "";

  const handleClick = () => {
    try {
      onBeforeNavigate?.();
    } finally {
      router.push(to);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${base} ${positionClass} ${className}`}
      aria-label={`Go back to ${to}`}
      title={text}
    >
      <span aria-hidden className="text-lg">←</span>
      <span className="whitespace-nowrap">{text}</span>
    </button>
  );
}
