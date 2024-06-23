// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: '/protected/:path*', // Qualquer rota que comece com /protected/
                destination: '/protected/dashboard', // Será redirecionada para /protected/dashboard
            },
        ];
    },
};

export default nextConfig;
