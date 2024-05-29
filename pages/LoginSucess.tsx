import '../app/globals.css';
import { useRouter } from 'next/router';

const LoginSuccess: React.FC = () => {
  const router = useRouter();
  const { name, picture } = router.query || {};

  const handleDepositClick = () => {
    router.push('/Deposit');
  };

  const handleWithdrawClick = () => {
    router.push('/Withdraw');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="flex">
        <div className="bg-white p-8 rounded shadow-md max-w-md text-center flex-1">
          <h1 className="text-2xl font-bold mb-4">Login Successful</h1>
          {name && (
            <p className="text-xl mb-4">
              Welcome, <span className="text-red-500">{name}!</span>
            </p>
          )}
          {picture && (
            <img
              src={picture as string}
              alt="Profile"
              className="w-24 h-24 rounded-full mx-auto mb-4"
            />
          )}
         
        </div>
        <div className="bg-blue-200 p-4 rounded shadow-md w-64">
          <h2 className="text-xl font-bold mb-4">Estimated Balance</h2>
          <p className="mb-2">BTC = 0.0</p>
          <p>$ = 00,00</p>
          <div className="mt-8">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4"
            onClick={handleDepositClick}>
              Deposit
            </button>
            <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleWithdrawClick}>
              Withdraw
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSuccess;