// src/components/ThemeToggle.tsx
"use client";

import React, { useEffect, useState } from "react";
import { FaMoon } from "react-icons/fa";
import { ImSun } from "react-icons/im";
import { useTheme } from "@/context/ThemeContext";

// Helpers simples de cookie (client-side)
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}
function setCookie(
  name: string,
  value: string,
  days = 365,
  opts: { path?: string; sameSite?: "Lax" | "Strict" | "None"; secure?: boolean } = {}
) {
  if (typeof document === "undefined") return;
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  const path = opts.path ?? "/";
  const sameSite = opts.sameSite ?? "Lax";
  const secure = opts.secure ?? (typeof location !== "undefined" && location.protocol === "https:");
  document.cookie =
    `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=${path};SameSite=${sameSite}` +
    (secure ? ";Secure" : "");
}

const COOKIE_KEY = "theme"; // "light" | "dark"

const ThemeToggle: React.FC = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [initialized, setInitialized] = useState(false);

  // Inicializa lendo cookie; se não existir, usa prefers-color-scheme
  useEffect(() => {
    try {
      const saved = getCookie(COOKIE_KEY); // "light" | "dark" | null
      if (saved === "dark" && !darkMode) {
        toggleDarkMode();
      } else if (saved === "light" && darkMode) {
        toggleDarkMode();
      } else if (!saved) {
        // Sem cookie: respeita o sistema
        const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
        if (prefersDark !== darkMode) {
          toggleDarkMode();
        }
        // grava cookie para estabilizar as próximas visitas
        setCookie(COOKIE_KEY, prefersDark ? "dark" : "light", 365, { sameSite: "Lax" });
      }
    } catch {
      // se algo falhar, apenas segue com o estado atual do contexto
    } finally {
      setInitialized(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // roda uma vez; o contexto cuidará do estado após isso

  // Sempre que o tema mudar, persiste no cookie
  useEffect(() => {
    if (!initialized) return;
    try {
      setCookie(COOKIE_KEY, darkMode ? "dark" : "light", 365, { sameSite: "Lax" });
    } catch {}
  }, [darkMode, initialized]);

  if (!initialized) return null;

  const title = darkMode ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={toggleDarkMode}
      aria-pressed={darkMode}
      title={title}
      aria-label={title}
      className="focus:outline-none transition duration-300 cursor-pointer
                 text-slate-700 hover:text-yellow-500 dark:text-gray-200 dark:hover:text-blue-300"
    >
      {darkMode ? <FaMoon className="text-2xl" /> : <ImSun className="text-2xl" />}
    </button>
  );
};

export default ThemeToggle;
