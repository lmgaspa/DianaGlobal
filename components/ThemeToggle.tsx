// ThemeToggle.tsx
import React from 'react';
import { FaMoon } from "react-icons/fa";
import { ImSun } from "react-icons/im";

const ThemeToggle: React.FC<{ darkMode: boolean; onClick: () => void }> = ({ darkMode, onClick }) => {
  return (
    <button onClick={onClick} className="focus:outline-none">
      {darkMode ? <FaMoon /> : <ImSun />}
    </button>
  );
};

export default ThemeToggle;
