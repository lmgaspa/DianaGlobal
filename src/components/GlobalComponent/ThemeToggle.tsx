"use client";
import React, { useEffect, useState } from 'react';
import { FaMoon } from "react-icons/fa";
import { ImSun } from "react-icons/im";
import { useTheme } from '@/context/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const isDarkMode = localStorage.getItem('darkMode');
    if (isDarkMode !== null) {
      toggleDarkMode();
    }
    setInitialized(true);
  }, [toggleDarkMode]);

  if (!initialized) return null;

  return (
    <button onClick={toggleDarkMode} className="focus:outline-none hover:text-yellow-500 transition duration-300 cursor-pointer">
      {darkMode ? <FaMoon className="text-2xl" /> : <ImSun className="text-2xl" />}
    </button>
  );
};

export default ThemeToggle;
