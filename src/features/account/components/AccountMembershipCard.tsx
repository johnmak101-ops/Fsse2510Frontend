/**
 * @file user Membership Status Card
 * @module features/account/components/AccountMembershipCard
 * 
 * displays the user's current membership tier, points, and spending progress.
 * implements conditional logic to flag "Upgrade Blocked" states when profile info is incomplete.
 * integrates with `membershipService` for tier configuration data.
 */

"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { cn } from "@/lib/utils";
import { MembershipLevel, MembershipConfig } from "@/types/membership";
import { RiVipCrownLine, RiCoinLine, RiExchangeDollarLine, RiErrorWarningLine } from "@remixicon/react";
import { useEffect, useState } from "react";
import { getPublicMembershipTiers } from "@/services/membership.service";

/** 
 * visual summary of user loyalty status. 
 * calculates progress towards the next tier rank and provides actionable fixes for profile deficiencies.
 */
export default function AccountMembershipCard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [tiers, setTiers] = useState<MembershipConfig[]>([]);

  useEffect(() => {
    getPublicMembershipTiers().then(setTiers).catch(() => setTiers([]));
  }, []);

  if (!user) return null;

  const nextTier = tiers.find(t => {
    const currentRank = Object.values(MembershipLevel).indexOf(user.membership.level as MembershipLevel);
    const tierRank = Object.values(MembershipLevel).indexOf(t.level);
    return tierRank === currentRank + 1;
  });

  const isUpgradeBlocked = !user.isInfoComplete && nextTier && user.cycleSpending >= nextTier.minSpend;

  const getLevelColor = (level: MembershipLevel) => {
    switch (level) {
      case MembershipLevel.DIAMOND:
        return "bg-linear-to-br from-stone-900 via-stone-700 to-stone-900 text-white border-stone-600";
      case MembershipLevel.GOLD:
        return "bg-linear-to-br from-yellow-100 via-yellow-200 to-yellow-100 text-yellow-900 border-yellow-200";
      case MembershipLevel.SILVER:
        return "bg-linear-to-br from-stone-100 via-stone-200 to-stone-100 text-stone-800 border-stone-200";
      default: // BRONZE
        return "bg-linear-to-br from-orange-50 via-orange-100 to-orange-50 text-orange-900 border-orange-200";
    }
  };

  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xl border",
      getLevelColor(user.membership.level)
    )}>
      <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">

        {/* Left: Level Info */}
        <div className="flex items-center gap-3 md:gap-4">
          <div className="p-3 md:p-4 rounded-full bg-white/20 backdrop-blur-md border border-white/30">
            <RiVipCrownLine className="w-6 h-6 md:w-8 md:h-8" />
          </div>
          <div>
            <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-[0.15em] md:tracking-[0.2em] opacity-80 mb-0.5 md:mb-1">Current Membership</h3>
            <h2 className="text-2xl md:text-3xl font-serif tracking-tight">{user.membership.level}</h2>
          </div>
        </div>

        {/* Right: Stats */}
        <div className="flex flex-col items-start lg:items-end gap-4 w-full lg:w-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex gap-4 md:gap-8 w-full lg:w-auto">
            <div className="flex flex-col items-start lg:items-end">
              <div className="flex items-center gap-1.5 md:gap-2 mb-1 opacity-80">
                <RiCoinLine size={12} className="md:size-14" />
                <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">Points</span>
              </div>
              <span className="text-xl md:text-2xl font-bold font-mono">{user.points}</span>
            </div>

            <div className="flex flex-col items-start lg:items-end">
              <div className="flex items-center gap-1.5 md:gap-2 mb-1 opacity-80">
                <RiExchangeDollarLine size={12} className="md:size-14" />
                <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">Yearly</span>
              </div>
              <span className="text-xl md:text-2xl font-bold font-mono">${user.cycleSpending}</span>
            </div>

            <div className="flex flex-col items-start lg:items-end col-span-2 sm:col-span-1">
              <div className="flex items-center gap-1.5 md:gap-2 mb-1 opacity-80">
                <RiExchangeDollarLine size={12} className="md:size-14" />
                <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">Upgrade Progress</span>
              </div>
              <span className="text-xl md:text-2xl font-bold font-mono">${user.accumulatedSpending}</span>
            </div>
          </div>

          <button
            onClick={() => router.push('/membership/info')}
            className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full border border-white/30 transition-all flex items-center gap-2 group self-start lg:self-auto"
          >
            View Grading & Calculation
            <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
          </button>
        </div>
      </div>

      {/* Upgrade Blocked Warning */}
      {isUpgradeBlocked && (
        <div className="mt-6 p-4 bg-red-500/20 backdrop-blur-md rounded-2xl border border-red-500/30 flex items-center gap-4 text-white">
          <div className="p-2 rounded-full bg-red-500">
            <RiErrorWarningLine size={20} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold">Upgrade Blocked</p>
            <p className="text-[11px] opacity-90">
              You qualify for {nextTier.level}! Please complete your name and phone number in settings to unlock your upgrade.
            </p>
          </div>
          <button
            onClick={() => router.push('/account?tab=settings')}
            className="px-4 py-1.5 bg-white text-red-600 text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-red-50 transition-colors"
          >
            Fix Now
          </button>
        </div>
      )}

      {/* Decorative Background */}
      <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-black/5 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}
