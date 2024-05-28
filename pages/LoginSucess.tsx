import { useRouter } from 'next/router';

const LoginSuccess: React.FC = () => {
  const router = useRouter();
    const { name, picture } = router.query || {};

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-center">
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
        </div>
      );
    };

export default LoginSuccess;
