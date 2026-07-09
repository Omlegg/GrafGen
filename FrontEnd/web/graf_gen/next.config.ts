import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5166',
        pathname: '/api/identity/profile-picture/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5166',
        pathname: '/content/posts/**', // Add this line for your posts
      },
    ],
  },
};

export default nextConfig;
