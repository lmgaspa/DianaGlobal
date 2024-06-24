// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: '/api/:path*'
        },
        {
          source: '/:path*',
          destination: '/protected/dashboard'
        }
      ];
    }
  };
  
  export default nextConfig;
  
