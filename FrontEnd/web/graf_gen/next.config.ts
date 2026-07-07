import type { NextConfig } from "next";
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5166',
        pathname: '/api/identity/profile-picture/**',
      },
    ],
  },
};

export default nextConfig;
