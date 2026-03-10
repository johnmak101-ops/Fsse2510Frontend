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
            value: 'same-origin-allow-popups',
          },
          {
            key: 'Content-Security-Policy-Report-Only',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://js.stripe.com https://accounts.google.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://images.johnmak.store https://johnmak.store https://www.johnmak.store",
              "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://api.stripe.com https://api.johnmak.store https://johnmak.store https://www.johnmak.store",
              "frame-src https://*.firebaseapp.com https://js.stripe.com https://accounts.google.com",
              "font-src 'self' data:",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
