import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone", // Required for AWS Amplify SSR
  reactStrictMode: false,
  reactCompiler: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.johnmak.store',
      },
      {
        protocol: 'https',
        hostname: 'johnmak.store',
      },
      {
        protocol: 'http',
        hostname: 'localhost:8080',
      },
      {
        protocol: 'https',
        hostname: 'www.johnmak.store', // Added www
      }
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'unsafe-none',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
