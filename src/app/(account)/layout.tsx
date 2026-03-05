/**
 * @file main Account management Layout
 * @module app/(account)/layout
 * 
 * provides the structural shell for user-focused profile and history pages.
 * implements a centered, standard-width container for dashboard consistency.
 */

import { ReactNode } from "react";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";

/** 
 * persistent layout for account routes. 
 * maintains consistent spacing and global navigation for the personal dashboard area.
 */
export default function AccountLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col bg-stone-50">
            <Navbar />

            <div className="flex-1 container mx-auto px-4 py-8 md:py-12 lg:px-12 pt-24 md:pt-32">
                <main className="w-full max-w-6xl mx-auto">
                    {children}
                </main>
            </div>

            <Footer />
        </div>
    );
}
