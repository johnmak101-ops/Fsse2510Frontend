/**
 * @file administrative management Layout
 * @module app/(admin)/layout
 * 
 * provides a secure, dark-themed structural shell for administrative modules.
 * enforces role-based access control via the `AdminGuard` component.
 * adopts a "force-dynamic" strategy to ensure real-time management data consistency.
 */

import Link from "next/link";
import AdminGuard from "@/components/common/AdminGuard";
import { ReactNode } from "react";

export const dynamic = 'force-dynamic';

/** 
 * persistent layout container for admin routes. 
 * manages sidebar navigation and high-contrast styling for the administrative dashboard.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <AdminGuard>
            <div className="flex min-h-screen bg-stone-900 text-white">
                <aside className="w-64 bg-stone-800 p-8 hidden md:block">
                    <div className="text-xl font-serif mb-12 tracking-tight">Admin Panel</div>
                    <nav className="flex flex-col gap-6 uppercase tracking-[0.2em] text-[10px] font-bold">
                        <Link href="/admin/products" className="text-white/60 hover:text-white transition-colors cursor-pointer">Products</Link>
                        <Link href="/admin/promotions" className="text-white/60 hover:text-white transition-colors cursor-pointer">Promotions</Link>
                        <Link href="/admin/coupons" className="text-white/60 hover:text-white transition-colors cursor-pointer">Coupons</Link>
                        <Link href="/admin/membership" className="text-white/60 hover:text-white transition-colors cursor-pointer">Membership</Link>
                        <Link href="/admin/orders" className="text-white/60 hover:text-white transition-colors cursor-pointer">Orders</Link>
                        <Link href="/admin/slider" className="text-white/60 hover:text-white transition-colors cursor-pointer border-t border-white/10 pt-6">Home Slider</Link>
                        <Link href="/admin/navigation" className="text-white/60 hover:text-white transition-colors cursor-pointer">Navigation</Link>
                        <Link href="/admin/banners" className="text-white/60 hover:text-white transition-colors cursor-pointer">Collection Banners</Link>


                        <Link href="/" className="text-white/40 hover:text-white transition-colors cursor-pointer border-t border-white/10 pt-6 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
                            Back to Site
                        </Link>
                    </nav>
                </aside>
                <main className="flex-1 p-8 md:p-12 bg-white text-brand-text">
                    {children}
                </main>
            </div>
        </AdminGuard>
    );
}
