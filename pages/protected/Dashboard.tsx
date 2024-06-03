import '../../app/globals.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { signOut } from 'next-auth/react';

const Dashboard: React.FC = () => {
  const router = useRouter();
  const { userId } = router.query; // Obtendo o ID do usuário da query da rota
  console.log(userId)
  const { email } = router.query as { email: string };
  const [address, setAddress] = useState<string>('');
  const [balance, setBalance] = useState<number | null>(null);

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
  
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        if (address) {
          const response = await axios.get(`https://api.bitcore.io/api/BTC/mainnet/address/${address}/balance`);
          const fetchedBalance = response.data.balance;
          console.log('Raw balance:', fetchedBalance); // Depuração
          const balanceInBTC = parseFloat(fetchedBalance) / 1e8;
          if (!isNaN(balanceInBTC)) {
            setBalance(balanceInBTC);
          } else {
            console.error('Invalid balance:', fetchedBalance);
            setBalance(null);
          }
        }
      } catch (error) {
        console.error('Error fetching balance:', error);
        setBalance(null);
      }
    };

    if (address) {
      fetchBalance();
    }
  }, [address]);

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
          {userId && (
            <p className="text-xl mb-4">
              Welcome, <br></br><br></br>
              your user ID is: <span className="text-red-500">{userId}!</span>
            </p>)}
          {email && (
            <p className="text-xl mb-4">
              E-mail:<span className="text-red-500"> {email}!</span>
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
          
          {balance !== null ? <p className="mb-2">Balance: {balance.toFixed(8)} BTC</p> : <p>Loading balance...</p>}
          
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
