// components/ThemeToggle.tsx
import React from 'react';
import { FaMoon } from "react-icons/fa";
import { ImSun } from "react-icons/im";
import { useTheme } from '../context/ThemeContext'; // Corrigir o caminho de importação

const ThemeToggle: React.FC = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <button onClick={toggleDarkMode} className="focus:outline-none">
      {darkMode ? <FaMoon /> : <ImSun />}
    </button>
  );
};

export default ThemeToggle;
