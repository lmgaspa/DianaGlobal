// components/NavBar.tsx
import React, { useState } from 'react';
import Link from 'next/link';
import { FaBars, FaTimes } from "react-icons/fa";
import ThemeToggle from './ThemeToggle';

const NavBar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(prevMenuOpen => !prevMenuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="w-full p-4 bg-blue-300 text-gray-900 dark:bg-black dark:text-gray-100">
      <div className="flex justify-between items-center w-full max-w-7xl mx-auto px-4">
        <div className="text-xl font-bold">
          <Link href="/App" legacyBehavior>
            <a>Diana Global</a>
          </Link>
        </div>
        <div className="flex space-x-4 items-center md:hidden">
          {!menuOpen && <ThemeToggle />}
          <button onClick={toggleMenu} className="focus:outline-none">
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
        <ul className="hidden md:flex md:flex-row md:items-center md:space-x-4">
          <li>
            <Link href="/login" legacyBehavior>
              <a className="px-4 py-2 bg-white text-black rounded hover:bg-blue-100 transition">
                Login
              </a>
            </Link>
          </li>
          <li>
            <Link href="/signup" legacyBehavior>
              <a className="px-4 py-2 bg-white text-black rounded hover:bg-blue-100 transition">
                Sign Up
              </a>
            </Link>
          </li>
          <div className="hidden md:block">
            <ThemeToggle />
          </div>
        </ul>
      </div>
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-blue-300 text-gray-900 dark:bg-black dark:text-gray-100 md:hidden">
          <div className="flex justify-end w-full p-4">
            <button onClick={toggleMenu} className="text-white focus:outline-none">
              <FaTimes size={24} />
            </button>
          </div>
          <ul className="flex flex-row w-full mt-4">
            <li className="w-1/2 flex justify-center">
              <Link href="/login" legacyBehavior>
                <a onClick={closeMenu} className="px-4 py-2 bg-white text-black rounded hover:bg-blue-100 transition w-11/12 text-center">
                  Login
                </a>
              </Link>
            </li>
            <li className="w-1/2 flex justify-center">
              <Link href="/signup" legacyBehavior>
                <a onClick={closeMenu} className="px-4 py-2 bg-white text-black rounded hover:bg-blue-100 transition w-11/12 text-center">
                  Sign Up
                </a>
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
