import type { NextConfig } from "next";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const apiHostname = apiUrl ? new URL(apiUrl).hostname : '';

const nextConfig: NextConfig = {
    output: 'standalone',
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '3333',
                pathname: '/uploads/**',
            },
            {
                protocol: 'https',
                hostname: apiHostname,
                port: '',
                pathname: '/uploads/**',
            },
            {
                protocol: 'https',
                hostname: 'ui-avatars.com',
            },
            {
                protocol: 'https',
                hostname: 'graph.facebook.com',
            }
        ],
    },
};

export default nextConfig;