import { signIn } from 'next-auth/react';

const GoogleButton = () => {
  return (
    <button
      className="flex items-center justify-center w-50 h-12 mx-auto gap-8 rounded border border-gray-300 bg-white px-4 py-4 text-sm drop-shadow-md hover:bg-gray-50"
      onClick={() => signIn('google', { callbackUrl: '/protected/dashboard' })}
      aria-label="Sign in with Google"
    >
      <span className="GoogleLogo text-black" style={{ padding: '12px' }}>Continue with Google</span>
    </button>
  );
};

export default GoogleButton;
