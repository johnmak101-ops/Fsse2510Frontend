/**
 * @file promotional Membership status Incentivizer
 * @module features/cart/components/MembershipUpgradeBanner
 * 
 * calculates and displays potential discount benefits achievable by reaching higher membership tiers.
 * dynamically identifies the next logical tier based on the current user's level or guest status.
 */

"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Promotion, PromotionType, promotionService } from "@/services/promotion.service";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useRouter } from "next/navigation";

/** internal mapping for comparing relative membership status. */
const HIERARCHY: Record<string, number> = {
    "NO_MEMBERSHIP": 0,
    "BRONZE": 1,
    "SILVER": 2,
    "GOLD": 3,
    "DIAMOND": 4
};

/**
 * membership progression banner.
 * features automated promotion filtering to find the most relevant 'next step' for the user.
 */
export default function MembershipUpgradeBanner() {
    const { user } = useAuthStore();
    const router = useRouter();
    const [upgradePromo, setUpgradePromo] = useState<Promotion | null>(null);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                // Fetch active MEMBERSHIP_DISCOUNT promos
                const promos = await promotionService.getActivePromotions([
                    PromotionType.MEMBERSHIP_DISCOUNT
                ]);

                if (cancelled) return;

                // Find the "best" upgrade opporunity
                // 1. If not logged in -> Find ANY member promo
                // 2. If logged in -> Find promo for HIGHER tier than current

                let target: Promotion | null = null;
                const currentLevel = user?.membership?.level || "NO_MEMBERSHIP";
                const currentRank = HIERARCHY[currentLevel] || 0;

                // Filter for promos targeting a higher rank
                const candidates = promos.filter(p => {
                    const targetLevel = p.targetMemberLevel;
                    if (!targetLevel) return false;
                    const targetRank = HIERARCHY[targetLevel] || 99;
                    return targetRank > currentRank;
                });

                if (candidates.length > 0) {
                    // Sort by rank ascending (nearest achievable tier)
                    candidates.sort((a, b) => {
                        const rankA = HIERARCHY[a.targetMemberLevel!] || 99;
                        const rankB = HIERARCHY[b.targetMemberLevel!] || 99;
                        return rankA - rankB;
                    });

                    target = candidates[0];
                }

                setUpgradePromo(target);

            } catch (err) {
                console.warn("Failed to fetch membership promos", err);
            }
        })();

        return () => { cancelled = true; };
    }, [user]);

    if (!upgradePromo) return null;

    const isGuest = !user;
    const targetLevel = upgradePromo.targetMemberLevel;
    const discountText = upgradePromo.discountType === "PERCENTAGE"
        ? `${upgradePromo.discountValue}% OFF`
        : `$${upgradePromo.discountValue} OFF`;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-8"
            >
                <div className="relative overflow-hidden group rounded-xl border border-indigo-100 bg-gradient-to-r from-[#F8F9FF] to-[#F1F3FF] p-6 shadow-sm">

                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl transition-all group-hover:bg-indigo-500/10"></div>

                    <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-indigo-50">
                                <span className="text-2xl">👑</span>
                            </div>
                            <div>
                                <h4 className="font-serif text-lg font-medium text-slate-800">
                                    {isGuest
                                        ? "Unlock Member Exclusives!"
                                        : `Unlock ${targetLevel} Status Benefits`}
                                </h4>
                                <p className="text-sm text-slate-600">
                                    {isGuest
                                        ? `Join today to unlock ${discountText} on selected items!`
                                        : `Accumulate spending to reach ${targetLevel} and enjoy ${discountText} on selected items!`}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => router.push(isGuest ? "/login?redirect=/cart" : "/membership/info")}
                            className="whitespace-nowrap px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm shadow-indigo-200"
                        >
                            {isGuest ? "Sign In / Register" : "View Membership Info"}
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
