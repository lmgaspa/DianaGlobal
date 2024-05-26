import React from 'react';

const NavBar: React.FC = () => {
  return (
    <nav className="w-full p-4 bg-blue-300 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
      <ul className="flex justify-between items-center w-full max-w-7xl mx-auto px-4">
        <li className="text-xl font-bold">
          <a>Diana Global</a>
        </li>
        <div className="flex space-x-4">
          <li>
            <a href="#Login" className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-blue-600 transition">
              Login
            </a>
          </li>
          <li>
            <a href="#SignUp" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition">
              Sign Up
            </a>
          </li>
        </div>
      </ul>
    </nav>
  );
};

export default NavBar;
