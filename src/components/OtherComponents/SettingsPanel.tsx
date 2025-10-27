"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function SettingsPanel(): JSX.Element {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Toggle FAB */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full shadow-lg
                   bg-blue-600 hover:bg-blue-700 text-white transition
                   focus:outline-none focus:ring-2 focus:ring-blue-400"
        aria-label={open ? "Close Settings" : "Open Settings"}
        title={open ? "Close Settings" : "Open Settings"}
      >
        {/* simple gear icon */}
        <span className="inline-block text-xl" aria-hidden>
          ⚙️
        </span>
      </button>

      {/* Slide-over panel */}
      <aside
        className={`fixed inset-y-0 right-0 z-40 w-80 max-w-[85vw] transform bg-white dark:bg-zinc-900
                    border-l border-zinc-200 dark:border-zinc-800 shadow-xl transition-transform
                    ${open ? "translate-x-0" : "translate-x-full"}`}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Settings</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded p-2 text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white
                       focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Close panel"
            title="Close"
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-3">
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Manage your account security:
          </p>

          <Link
            href="/protected/change-password"
            className="block w-full text-center rounded-md bg-blue-600 hover:bg-blue-700
                       text-white py-2.5 transition"
          >
            Change Password
          </Link>

          <Link
            href="/protected/change-email"
            className="block w-full text-center rounded-md bg-zinc-800 hover:bg-zinc-900
                       text-white py-2.5 transition dark:bg-zinc-700 dark:hover:bg-zinc-600"
          >
            Change Email
          </Link>
        </div>

        <div className="mt-auto px-4 py-3 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400">
          Tip: Always keep your e-mail up to date to receive security alerts.
        </div>
      </aside>

      {/* Backdrop */}
      {open && (
        <button
          aria-hidden
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-[1px]"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
