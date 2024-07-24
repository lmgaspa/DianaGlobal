import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full p-4 bg-blue-300 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
      <div className="container mx-auto px-4">
        <p className="text-center">&copy; 2024 Diana Global</p>
        <div className="flex justify-center mt-4">
          <a href="/privacy-policy" className="mx-2 hover:text-gray-300">Privacy Policy</a>
          <a href="#" className="mx-2 hover:text-gray-300">Terms of Service</a>
          <a href="#" className="mx-2 hover:text-gray-300">Cookies Policy</a>
          <a href="#" className="mx-2 hover:text-gray-300">Disclosures</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
