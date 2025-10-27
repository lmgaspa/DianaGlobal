/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: '/forgotPassword', destination: '/forgot-password', permanent: true },
      { source: '/resetPassword',  destination: '/reset-password',  permanent: true },
      { source: '/checkEmail',     destination: '/check-email',     permanent: true },
    ];
  },
};
export default nextConfig;
