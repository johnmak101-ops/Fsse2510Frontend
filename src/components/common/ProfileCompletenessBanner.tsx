/**
 * @file user Profile completion Incentivizer 
 * @module components/common/ProfileCompletenessBanner
 * 
 * displays an amber attention-bar if the user has missing profile fields.
 * leverages membership point logic to encourage data completion.
 */

"use client";

import Link from "next/link";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { RiErrorWarningLine, RiArrowRightLine } from "@remixicon/react";

/**
 * conditional profile status banner.
 * only visible to authenticated users who have not finished their profile setup.
 */
export default function ProfileCompletenessBanner() {
    const { user } = useAuthStore();

    // WHY: only display prompt if a session exists and the completeness flag from the server is false.
    if (!user || user.isInfoComplete) return null;

    return (
        <div className="bg-amber-50 border-b border-amber-200">
            <div className="max-w-[1440px] mx-auto px-6 py-2.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-amber-900">
                    <RiErrorWarningLine size={18} className="shrink-0" />
                    <p className="text-[12px] font-medium tracking-wide">
                        Your profile is incomplete. Complete it now to unlock membership points and tier upgrades.
                    </p>
                </div>
                <Link
                    href="/account?tab=settings"
                    className="flex items-center gap-1.5 px-3 py-1 bg-amber-900 text-white text-[11px] font-bold uppercase tracking-wider rounded-full hover:bg-amber-800 transition-colors shrink-0"
                >
                    Complete Profile
                    <RiArrowRightLine size={14} />
                </Link>
            </div>
        </div>
    );
}
