// components/ThemeToggle.tsx
import React, { useEffect, useState } from 'react';
import { FaMoon } from "react-icons/fa";
import { ImSun } from "react-icons/im";
import { useTheme } from '../context/ThemeContext'; // Corrigir o caminho de importação

const ThemeToggle: React.FC = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Verifica se o tema escuro foi definido no armazenamento local ao carregar o componente
    const isDarkMode = localStorage.getItem('darkMode');
    if (isDarkMode !== null) {
      toggleDarkMode();
    }
    setInitialized(true);
  }, [toggleDarkMode]);

  if (!initialized) return null;

  return (
    <button onClick={toggleDarkMode} className="focus:outline-none">
      {darkMode ? <FaMoon /> : <ImSun />}
    </button>
  );
};

export default ThemeToggle;
