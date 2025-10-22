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
  text = "Back",
  fixed = true,
  position = 'top-left',
  className = "",
  onBeforeNavigate,
}: Props) {
  const router = useRouter();

  const base = [
  "inline-flex items-center gap-1 xs:gap-2 rounded-md shadow-sm",
  "border border-zinc-300 bg-white px-2 py-1.5 xs:px-3 xs:py-2 text-xs xs:text-sm font-medium",
  "hover:bg-yellow-500 transition-colors",
  "dark:border-zinc-700 dark:bg-white dark:text-black dark:hover:bg-blue-200",
].join(" ");

  const positionClass = fixed ? 
    (position === 'above-box' ? 
      "fixed left-1/2 -translate-x-1/2 top-4 xs:top-6 sm:top-8 z-40" : 
      "fixed left-2 xs:left-4 top-16 xs:top-20 sm:top-24 md:top-28 lg:top-32 z-40"
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
      <span aria-hidden className="text-xs xs:text-sm sm:text-base">←</span>
      <span className="hidden xs:inline">{text}</span>
    </button>
  );
}
