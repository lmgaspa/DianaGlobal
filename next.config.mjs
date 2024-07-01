/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
      return [
        {
          source: '/protected/dashboard',
          destination: '/protected/dashboard', // mapeamento direto
        },
        {
          source: '/:path*',
          destination: '/:path*',
        },
      ];
    },
  };
  
  export default nextConfig;