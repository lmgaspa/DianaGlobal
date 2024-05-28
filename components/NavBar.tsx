import React, { useState } from 'react';
import Link from 'next/link';
import { FaMoon } from "react-icons/fa";
import { ImSun } from "react-icons/im";

const ThemeToggle: React.FC<{ darkMode: boolean; onClick: () => void }> = ({ darkMode, onClick }) => {
  return (
    <button onClick={onClick} className="focus:outline-none">
      {darkMode ? <FaMoon /> : <ImSun />}
    </button>
  );
};

const NavBar: React.FC = () => {
  const [darkMode, setDarkMode] = useState(true); // Supondo que você tenha um estado para o tema escuro/claro

  const toggleDarkMode = () => {
    setDarkMode(prevDarkMode => !prevDarkMode);
    // Aqui você pode adicionar lógica para atualizar o tema da aplicação
  };

  return (
    <nav className={`w-full p-4 ${darkMode ? 'bg-black text-gray-100' : 'bg-blue-300 text-gray-900'}`}>
      <ul className="flex justify-between items-center w-full max-w-7xl mx-auto px-4">
        <li className="text-xl font-bold">
          <Link href="/App" legacyBehavior>
            <a>Diana Global</a>
          </Link>
        </li>
        <div className="flex space-x-4 items-center">
          <li>
            <Link href="/LoginSignUp" legacyBehavior>
              <a className="px-4 py-2
               bg-white text-black rounded hover:bg-blue-100 transition">
                Login
              </a>
            </Link>
          </li>
          <li>
            <Link href="/SignUp" legacyBehavior>
              <a className="px-4 py-2
               bg-white text-black rounded hover:bg-blue-100 transition">
                Sign Up
              </a>
            </Link>
          </li>
          <ThemeToggle darkMode={darkMode} onClick={toggleDarkMode} />
        </div>
      </ul>
    </nav>
  );
};

export default NavBar;
