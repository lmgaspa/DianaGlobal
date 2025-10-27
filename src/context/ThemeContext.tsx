// src/context/ThemeContext.tsx
"use client";

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
  useMemo,
} from "react";
import { getCookie, setCookie } from "@/utils/cookies";

interface ThemeContextProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

interface ThemeProviderProps {
  children: ReactNode;
}

const COOKIE_KEY = "theme"; // "light" | "dark"

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Estado inicial: tenta cookie; caso contrário, usa prefers-color-scheme
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof document !== "undefined") {
      const saved = getCookie(COOKIE_KEY); // "light" | "dark" | null
      if (saved === "dark") return true;
      if (saved === "light") return false;

      const prefersDark =
        window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
      return prefersDark;
    }
    // fallback SSR
    return false;
  });

  // Aplica/remover classe "dark" e persiste em cookie
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    try {
      setCookie(COOKIE_KEY, darkMode ? "dark" : "light", 365, {
        sameSite: "Lax",
        secure:
          typeof location !== "undefined" && location.protocol === "https:",
      });
    } catch {
      // ignore
    }
  }, [darkMode]);

  // Reage à mudança de tema do SO se o usuário não tiver cookie salvo
  useEffect(() => {
    const saved = getCookie(COOKIE_KEY);
    if (saved) return; // já há preferência do usuário

    const mql = window.matchMedia?.("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => setDarkMode(e.matches);
    mql?.addEventListener?.("change", onChange);
    return () => mql?.removeEventListener?.("change", onChange);
  }, []);

  const toggleDarkMode = () => setDarkMode((v) => !v);

  const value = useMemo(
    () => ({ darkMode, toggleDarkMode }),
    [darkMode]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
};
