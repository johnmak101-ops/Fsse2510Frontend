/**
 * @file global application Layout
 * @module app/layout
 * 
 * the root layout file responsible for defining the HTML document structure, global font injection, and metadata configuration.
 * integrates authentication and global providers to the entire application tree.
 */

import type { Metadata } from "next";
import { Inter, Libre_Baskerville } from "next/font/google";
import "./globals.css";

/** secondary sans-serif font for utility text. */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/** primary serif font for brand headers and luxury messaging. */
const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-libre-baskerville",
  display: "swap",
});

/** global SEO and social sharing configuration. */
export const metadata: Metadata = {
  title: {
    template: "%s | Gelato Pique",
    default: "Gelato Pique | Japanese Luxury Roomwear",
  },
  description: "Experience the softest comfort with Gelato Pique's premium loungewear and roomwear collection.",
  metadataBase: new URL(
    (process.env.NEXT_PUBLIC_APP_URL?.startsWith('http') ? '' : 'https://') +
    (process.env.NEXT_PUBLIC_APP_URL || 'https://johnmak.store')
  ),
  icons: {
    icon: [
      { url: '/favicon/favicon.ico', sizes: 'any' },
      { url: '/favicon/favicon-32x32.png', type: 'image/png' },
      { url: '/favicon/favicon-16x16.png', type: 'image/png' },
    ],
    apple: [
      { url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '192x192',
        url: '/favicon/android-chrome-192x192.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '512x512',
        url: '/favicon/android-chrome-512x512.png',
      },
    ],
  },
};

import AuthProvider from "@/components/auth-provider";
import Providers from "@/app/providers";
import { ReactNode } from "react";

/**
 * root application layout component.
 * handles hydration suppression for browser extensions and applies global brand typography.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    // suppressHydrationWarning is used to prevent Hydration Errors caused by certain Browser Extensions
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${libreBaskerville.variable} font-sans antialiased bg-background text-foreground`}
      >
        <Providers>
          <AuthProvider>
            {children}
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}