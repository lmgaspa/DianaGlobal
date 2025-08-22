/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: '/resetPassword', destination: '/reset-password', permanent: true },
    ];
  },
};

export default nextConfig;
