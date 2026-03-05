/**
 * @file user Dashboard Entry
 * @module app/(account)/account/page
 * 
 * orchestrates the user's personal hub with tabbed navigation.
 * manages state for Orders, Wishlist, Addresses, and Profile Settings.
 * synchronizes with URL search parameters to support direct linking to specific tabs.
 */

/**
 * @file user Dashboard Entry
 * @module app/(account)/account/page
 * 
 * orchestrates the user's personal hub with tabbed navigation.
 * manages state for Orders, Wishlist, Addresses, and Profile Settings.
 * synchronizes with URL search parameters to support direct linking to specific tabs.
 */

"use client";

import AccountSettingsForm from "@/features/account/components/AccountSettingsForm";
import AccountAddressSection from "@/features/account/components/AccountAddressSection";
import AccountMembershipCard from "@/features/account/components/AccountMembershipCard";
import AccountTransactionList from "@/features/account/components/AccountTransactionList";
import AccountWishlistGrid from "@/features/account/components/AccountWishlistGrid";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Loader2 } from "lucide-react";

type Tab = "history" | "wishlist" | "settings" | "addresses";

/** 
 * inner content orchestrator for the account page. 
 * responsive view that dynamically renders the active management section based on user selection or URL state.
 */
function AccountContent() {
    const { user } = useAuthStore();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState<Tab>("history");

    useEffect(() => {
        const tab = searchParams.get("tab") as Tab;
        if (tab && ["history", "wishlist", "settings", "addresses"].includes(tab)) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setActiveTab(prev => prev === tab ? prev : tab);
        }
    }, [searchParams]);

    if (!user) return null;

    return (
        <div className="space-y-8 md:space-y-12 animate-in fade-in duration-700">
            {/* 1. Header & Membership Card */}
            <section>
                <div className="mb-6 md:mb-8">
                    <h1 className="font-serif text-2xl md:text-3xl text-brand-text mb-2">Welcome back, {user.fullName || "Member"}</h1>
                    <p className="text-stone-500 text-xs md:text-sm">Manage your account and view your latest orders.</p>
                </div>
                <AccountMembershipCard />
            </section>

            {/* 2. Tabs */}
            <section>
                <div className="flex items-center gap-4 md:gap-8 border-b border-stone-200 mb-6 md:mb-8 overflow-x-auto no-scrollbar scroll-smooth">
                    <button
                        onClick={() => setActiveTab("history")}
                        className={`pb-3 md:pb-4 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.15em] md:tracking-[0.2em] transition-all relative whitespace-nowrap ${activeTab === "history" ? "text-brand-text" : "text-stone-400 hover:text-brand-text"
                            }`}
                    >
                        Order History
                        {activeTab === "history" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-text rounded-full" />}
                    </button>
                    <button
                        onClick={() => setActiveTab("wishlist")}
                        className={`pb-3 md:pb-4 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.15em] md:tracking-[0.2em] transition-all relative whitespace-nowrap ${activeTab === "wishlist" ? "text-brand-text" : "text-stone-400 hover:text-brand-text"
                            }`}
                    >
                        My Wishlist
                        {activeTab === "wishlist" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-text rounded-full" />}
                    </button>
                    <button
                        onClick={() => setActiveTab("addresses")}
                        className={`pb-3 md:pb-4 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.15em] md:tracking-[0.2em] transition-all relative whitespace-nowrap ${activeTab === "addresses" ? "text-brand-text" : "text-stone-400 hover:text-brand-text"
                            }`}
                    >
                        Shipping Addresses
                        {activeTab === "addresses" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-text rounded-full" />}
                    </button>
                    <button
                        onClick={() => setActiveTab("settings")}
                        className={`pb-3 md:pb-4 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.15em] md:tracking-[0.2em] transition-all relative whitespace-nowrap ${activeTab === "settings" ? "text-brand-text" : "text-stone-400 hover:text-brand-text"
                            }`}
                    >
                        Account Settings
                        {activeTab === "settings" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-text rounded-full" />}
                    </button>
                </div>

                {/* 3. Tab Content */}
                <div className="min-h-100">
                    {activeTab === "history" && <AccountTransactionList />}
                    {activeTab === "wishlist" && <AccountWishlistGrid />}
                    {activeTab === "addresses" && <AccountAddressSection />}
                    {activeTab === "settings" && <AccountSettingsForm />}
                </div>
            </section>
        </div>
    );
}

export default function AccountPage() {
    return (
        <Suspense fallback={<div className="flex min-h-100 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-stone-300" /></div>}>
            <AccountContent />
        </Suspense>
    );
}
