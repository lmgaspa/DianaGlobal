/** @type {import('next').NextConfig} */
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = {
  async redirects() {
    return [
      { source: '/resetPassword', destination: '/reset-password', permanent: true },
    ]
  },
};

export default nextConfig;
