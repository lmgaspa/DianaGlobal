import '../../app/globals.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { signOut } from 'next-auth/react';

const Dashboard: React.FC = () => {
  const router = useRouter();
  const { name, picture } = router.query as { name?: string; picture?: string };
  const [address, setAddress] = useState<string>('');

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        // Verifica se o address já está salvo no localStorage
        const storedAddress = localStorage.getItem('address');
        if (storedAddress) {
          setAddress(storedAddress);
        } else {
          const response = await axios.get('https://btcex.onrender.com');
          const fetchedAddress = response.data.address;
          localStorage.setItem('address', fetchedAddress);
          setAddress(fetchedAddress);
        }
      } catch (error) {
        console.error('Error fetching address:', error);
      }
    };

    fetchAddress();
  }, []);

  const handleDepositClick = () => {
    router.push('/protected/deposit');
  };

  const handleWithdrawClick = () => {
    router.push('/protected/withdraw');
  };

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' }); // Redireciona para a página inicial após logout
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-black">
      <div className="flex">
        <div className="bg-white p-8 rounded shadow-md max-w-md text-center flex-1">
          <h1 className="text-2xl font-bold mb-4">Login Successful</h1>
          {name && (
            <p className="text-xl mb-4">
              Welcome<span className="text-red-500">{name}!</span>
            </p>
          )}
          {address && (
            <p className="text-md mb-4">
              Your address: <span className="text-blue-500">{address}</span>
            </p>
          )}
          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
        <div className="bg-blue-200 p-4 rounded shadow-md w-64 ml-4">
          <h2 className="text-xl font-bold mb-4">Estimated Balance</h2>
          <p className="mb-2">BTC = 0.0</p>
          <p>$ = 00,00</p>
          <div className="mt-8">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4"
              onClick={handleDepositClick}
            >
              Deposit
            </button>
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              onClick={handleWithdrawClick}
            >
              Withdraw
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
