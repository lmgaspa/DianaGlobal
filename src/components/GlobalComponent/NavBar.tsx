"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaBars, FaTimes } from 'react-icons/fa';
import ThemeToggle from './ThemeToggle';
import { handleLogout, isLogged } from '@/utils/authUtils';
import { useSession } from 'next-auth/react';

const NavBar: React.FC = () => {
  const { data: session } = useSession();
  const [isLoggedState, setIsLoggedState] = useState(false);

  useEffect(() => {
    const loggedIn = !!session?.user || isLogged();
    setIsLoggedState(loggedIn);
    console.log('Session data:', session);
    console.log('Initial isLoggedState:', loggedIn);
  }, [session]);

  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(prevMenuOpen => !prevMenuOpen);
    console.log('Menu toggled, menuOpen:', !menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
    console.log('Menu closed, menuOpen:', false);
  };

  return (
    <nav className="w-full p-4 bg-blue-300 text-gray-900  dark:bg-black dark:text-gray-100">
      <div className="flex justify-between items-center w-full max-w-7xl mx-auto px-4">
        <div className="text-xl font-bold">
          <Link href="/" legacyBehavior>
            <a>Diana Global</a>
          </Link>
        </div>
        <div className="flex space-x-4 items-center md:hidden">
          {!menuOpen && <ThemeToggle />}
          <button onClick={toggleMenu} className="focus:outline-none">
            {menuOpen ? <FaTimes className="text-2xl hover:text-yellow-500 transition duration-300 cursor-pointer" /> : <FaBars className="text-2xl hover:text-yellow-500 transition duration-300 cursor-pointer" />}
          </button>
        </div>
        <ul className="hidden md:flex md:flex-row md:items-center md:space-x-4">
          {isLoggedState ? (
            <>
              <li>
                <Link href="/protected/dashboard" legacyBehavior>
                  <a className="px-4 py-2 bg-white text-black rounded hover:bg-green-500 transition duration-300 cursor-pointer">
                    My Dashboard
                  </a>
                </Link>
              </li>
              <li>
                <button
                  onClick={async () => {
                    console.log('Logout clicked');
                    await handleLogout();
                    setIsLoggedState(false);
                  }}
                  className="px-4 py-2 bg-white text-black rounded hover:bg-green-500 transition duration-300 cursor-pointer"
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link href="/login" legacyBehavior>
                  <a className="px-4 py-2 bg-white text-black rounded hover:bg-green-500 transition duration-300 cursor-pointer">
                    Login
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/signup" legacyBehavior>
                  <a className="px-4 py-2 bg-white text-black rounded hover:bg-green-500 transition duration-300 cursor-pointer">
                    Sign Up
                  </a>
                </Link>
              </li>
            </>
          )}
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
          <ul className="flex flex-col w-full mt-4 space-y-4">
            {isLoggedState ? (
              <>
                <li className="w-full flex justify-center">
                  <Link href="/protected/dashboard" legacyBehavior>
                    <a onClick={closeMenu} className="px-4 py-2 bg-white text-black rounded hover:bg-blue-100 transition w-11/12 text-center">
                      My Dashboard
                    </a>
                  </Link>
                </li>
                <li className="w-full flex justify-center">
                  <button
                    onClick={async () => {
                      console.log('Logout clicked from menu');
                      await handleLogout();
                      setIsLoggedState(false);
                      closeMenu();
                    }}
                    className="px-4 py-2 bg-white text-black rounded hover:bg-blue-100 transition w-11/12 text-center"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="w-full flex justify-center">
                  <Link href="/login" legacyBehavior>
                    <a onClick={closeMenu} className="px-4 py-2 bg-white text-black rounded hover:bg-blue-100 transition w-11/12 text-center">
                      Login
                    </a>
                  </Link>
                </li>
                <li className="w-full flex justify-center">
                  <Link href="/signup" legacyBehavior>
                    <a onClick={closeMenu} className="px-4 py-2 bg-white text-black rounded hover:bg-blue-100 transition w-11/12 text-center">
                      Sign Up
                    </a>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
