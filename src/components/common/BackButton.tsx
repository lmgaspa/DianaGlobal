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
  /** Extra Tailwind classes to override/extend styles */
  className?: string;
  /** Optional callback before navigation */
  onBeforeNavigate?: () => void;
};

export default function BackButton({
  to,
  text = "Back",
  fixed = true,
  className = "",
  onBeforeNavigate,
}: Props) {
  const router = useRouter();

  const base = [
  "inline-flex items-center gap-2 rounded-md shadow-sm",
  "border border-zinc-300 bg-white px-3 py-2 text-sm font-medium",
  "hover:bg-yellow-500 transition-colors",
  "dark:border-zinc-700 dark:bg-white dark:text-black dark:hover:bg-blue-200",
].join(" ");

  const position = fixed ? "fixed left-4 top-4 z-40" : "";

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
      className={`${base} ${position} ${className}`}
      aria-label={`Go back to ${to}`}
      title={text}
    >
      <span aria-hidden>←</span>
      <span>{text}</span>
    </button>
  );
}
