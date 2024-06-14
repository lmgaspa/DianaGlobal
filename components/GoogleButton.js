import { signIn } from 'next-auth/react';

const GoogleButton = () => {
  const handleSignIn = async () => {
    await signIn('google', { callbackUrl: '/protected/dashboard' });
  };

  return (
    <button
      className="flex items-center justify-center w-50 h-12 mx-auto gap-2 rounded bg-white px-4 py-2 text-sm drop-shadow-md hover:bg-gray-50 focus:outline-none"
      onClick={handleSignIn}
      aria-label="Sign in with Google"
    >
      <GoogleLogo className="w-6 h-6" />
      <span>Continue with Google</span>
    </button>
  );
};

export default GoogleButton;

const GoogleLogo = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M24 12c0-3.717-1.258-6.734-3.412-9.016L12 2.591l-8.588.393C1.258 5.266 0 8.283 0 12s1.258 6.734 3.412 9.016L12 21.409l8.588-.393C22.742 18.734 24 15.717 24 12z"
      fill="#4285F4"
    />
    <path
      d="M24 12c0 1.167-.195 2.293-.54 3.348l-10.54-.488v-7.32h5.992c.263 1.386 1.026 2.567 2.172 3.393l3.874-3.794C21.435 9.23 24 10.975 24 12z"
      fill="#34A853"
    />
    <path
      d="M13.632 24c2.222 0 4.087-.734 5.465-1.982l-3.873-3.793c-1.076.715-2.446 1.135-3.92 1.135-3.006 0-5.544-2.022-6.446-4.764l-5.55 2.716C4.417 21.832 8.87 24 13.632 24z"
      fill="#FBBC05"
    />
    <path
      d="M6.186 14.063c-.17-.503-.263-1.036-.263-1.593s.093-1.09.263-1.593L1.578 6.328C.615 8.28 0 10.538 0 12s.615 3.72 1.578 5.672l4.608-3.609z"
      fill="#EB4335"
    />
  </svg>
);
