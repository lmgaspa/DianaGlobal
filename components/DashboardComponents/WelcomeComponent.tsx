import React from 'react';

interface WelcomeComponentProps {
  storedName: string | null;
  storedUserId: string | null;
  handleLogout: () => void;
}

const WelcomeComponent: React.FC<WelcomeComponentProps> = ({ storedName, storedUserId, handleLogout }) => {
  return (
    <div className="w-full md:w-1/3 p-4">
      <div className="border border-gray-300 p-6 rounded-3xl">
        <h2 className="text-xl font-bold mb-4">Welcome, {storedName || 'Guest'}</h2>
        <p>Your user ID: {storedUserId || 'N/A'}</p>
        <div className="w-full flex justify-center p-4">
          <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeComponent;