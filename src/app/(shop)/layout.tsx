/**
 * @file main Shop Layout
 * @module app/(shop)/layout
 * 
 * provides the globally shared UI structure for the commerce storefront.
 * implements the "Stacked Fixed Header" pattern for consistent navigation visibility.
 * adopts the "Gelato Cream" minimalist aesthetic foundation.
 */

import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import AnnouncementBar from "@/components/common/AnnouncementBar";
import ProfileCompletenessBanner from "@/components/common/ProfileCompletenessBanner";
import { ReactNode } from "react";

/** 
 * persistent layout container for shop routes. 
 * manages responsive header padding and z-index layering for global alerts and navigation.
 */
export default function ShopLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    // 1. Use bg-white to match V2.0 minimalist style
    <div className="flex min-h-screen flex-col bg-gelato-cream">
      {/* Stacked fixed header: Announcement Bar + Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex flex-col">
        {/* Secondary bars hidden on mobile for minimalist look */}
        <div className="hidden xl:block">
          <AnnouncementBar />
          <ProfileCompletenessBanner />
        </div>
        <Navbar />
      </div>

      {/* Mobile Padding (pt-20) matches Navbar h-20 */}
      <main className="flex-1 w-full pt-20 xl:pt-0">
        {children}
      </main>

      {/* 3. Fix Typo */}
      <Footer />
    </div>
  );
}