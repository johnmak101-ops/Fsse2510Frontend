"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MembershipConfig } from "@/types/membership";
import { getPublicMembershipTiers } from "@/services/membership.service";

export default function MembershipInfoPage() {
    const router = useRouter();
    const [tiers, setTiers] = useState<MembershipConfig[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const data = await getPublicMembershipTiers();
                // Sort by minSpend ascending
                data.sort((a, b) => a.minSpend - b.minSpend);
                setTiers(data);
            } catch (err) {
                console.error("Failed to fetch membership tiers", err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);



    return (
        <div className="min-h-screen bg-[#FDFBF7] pt-16 xl:pt-64">
            <div className="pb-20 px-4 max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className="font-serif text-4xl md:text-5xl text-slate-900 mb-6">
                        Membership Tiers & Benefits
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        A simple breakdown of our membership levels, requirements, and rewards.
                    </p>
                </motion.div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                ) : (
                    <div className="space-y-16">
                        {/* 1. Main Tiers Table */}
                        <div className="space-y-6">
                            {/* Desktop Table View (Hidden on mobile) */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="hidden md:block bg-white rounded-2xl shadow-sm border border-stone-200 overflow-x-auto"
                            >
                                <table className="w-full text-left border-collapse min-w-[800px]">
                                    <thead className="bg-stone-50/80 border-b border-stone-200">
                                        <tr>
                                            <th className="px-6 py-5 font-bold text-slate-800 text-sm uppercase tracking-wider">Tier Level</th>
                                            <th className="px-6 py-5 font-bold text-slate-800 text-sm uppercase tracking-wider text-center">Min. Spend</th>
                                            <th className="px-6 py-5 font-bold text-slate-800 text-sm uppercase tracking-wider text-center">Point Rate</th>
                                            <th className="px-6 py-5 font-bold text-slate-800 text-sm uppercase tracking-wider text-center">Validity</th>
                                            <th className="px-6 py-5 font-bold text-slate-800 text-sm uppercase tracking-wider text-center">Retention</th>
                                            <th className="px-6 py-5 font-bold text-slate-800 text-sm uppercase tracking-wider text-center">Grace Period</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-100">
                                        {tiers.map((t) => (
                                            <tr key={t.level} className={`hover:bg-stone-50/50 transition-colors ${t.level === 'BRONZE' ? 'bg-amber-50/10' : ''}`}>
                                                <td className="px-6 py-6">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-900 tracking-tight">{t.level.replace('_', ' ')}</span>
                                                        {t.level === 'NO_MEMBERSHIP' && <span className="text-[10px] text-slate-400 font-medium tracking-wider">GUEST STATUS</span>}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6 text-center">
                                                    {t.minSpend === 0 ? (
                                                        <span className="text-slate-400 italic text-sm">Free Entry</span>
                                                    ) : (
                                                        <span className="font-bold text-slate-800 text-lg">HK${t.minSpend.toLocaleString()}</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-6 text-center">
                                                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold text-sm border border-indigo-100 min-w-[50px]">
                                                        {(t.pointRate * 100).toFixed(0)}%
                                                    </span>
                                                </td>
                                                <td className="px-6 py-6 text-center">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full font-bold text-xs border uppercase tracking-wider ${t.level === 'BRONZE' || t.level === 'NO_MEMBERSHIP'
                                                        ? 'bg-slate-50 text-slate-500 border-slate-200'
                                                        : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                        }`}>
                                                        {t.level === 'BRONZE' || t.level === 'NO_MEMBERSHIP' ? 'Lifetime' : '1 Year'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-6 text-center">
                                                    {t.level === 'BRONZE' ? (
                                                        <span className="text-slate-500 font-medium text-sm">Permanent</span>
                                                    ) : t.level === 'NO_MEMBERSHIP' ? (
                                                        <span className="text-slate-300 font-medium text-sm">N/A</span>
                                                    ) : (
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-slate-800 font-bold text-sm">HK${t.minSpend.toLocaleString()}</span>
                                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Annual Spend</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-6 text-center">
                                                    {t.level === 'BRONZE' || t.level === 'NO_MEMBERSHIP' ? (
                                                        <span className="text-slate-300 font-medium text-sm">N/A</span>
                                                    ) : (
                                                        <span className="text-slate-600 font-bold text-sm bg-stone-100 px-2.5 py-1 rounded border border-stone-200">
                                                            {t.gracePeriodDays} Days
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </motion.div>

                            {/* Mobile Card View (Hidden on desktop) */}
                            <div className="md:hidden space-y-4 px-2">
                                {tiers.map((t, idx) => (
                                    <motion.div
                                        key={t.level}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 * idx }}
                                        className={`p-6 rounded-2xl border ${t.level === 'BRONZE' ? 'bg-amber-50/30 border-amber-200' : 'bg-white border-stone-200'
                                            } shadow-sm`}
                                    >
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <h3 className="font-bold text-xl text-slate-900 tracking-tight">
                                                    {t.level.replace('_', ' ')}
                                                </h3>
                                                {t.level === 'NO_MEMBERSHIP' && (
                                                    <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-0.5 block">Guest Status</span>
                                                )}
                                            </div>
                                            <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-indigo-600 text-white font-bold text-sm shadow-sm">
                                                {(t.pointRate * 100).toFixed(0)}% <span className="text-[10px] ml-1 opacity-80 uppercase tracking-tighter">Rate</span>
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                                            <div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Min. Spend</div>
                                                <div className="text-slate-900 font-bold">
                                                    {t.minSpend === 0 ? <span className="italic text-slate-500 font-normal">Free Entry</span> : `HK$${t.minSpend.toLocaleString()}`}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Validity</div>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-bold text-[10px] border uppercase tracking-wider ${t.level === 'BRONZE' || t.level === 'NO_MEMBERSHIP'
                                                    ? 'bg-slate-50 text-slate-500 border-slate-200'
                                                    : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                    }`}>
                                                    {t.level === 'BRONZE' || t.level === 'NO_MEMBERSHIP' ? 'Lifetime' : '1 Year'}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Retention</div>
                                                <div className="text-slate-900 font-bold flex flex-col">
                                                    {t.level === 'BRONZE' ? (
                                                        <span className="text-sm font-medium text-slate-600">Permanent</span>
                                                    ) : t.level === 'NO_MEMBERSHIP' ? (
                                                        <span className="text-sm font-medium text-slate-300">N/A</span>
                                                    ) : (
                                                        <>
                                                            <span className="text-sm">HK${t.minSpend.toLocaleString()}</span>
                                                            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter -mt-0.5">Yearly Spend</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Grace Period</div>
                                                <div className="text-slate-900 font-bold">
                                                    {t.level === 'BRONZE' || t.level === 'NO_MEMBERSHIP' ? (
                                                        <span className="text-sm font-medium text-slate-300">N/A</span>
                                                    ) : (
                                                        <span className="text-sm text-slate-700">{t.gracePeriodDays} Days</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* 2. Enhanced Explanation Sections */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 flex flex-col justify-between"
                            >
                                <div>
                                    <h3 className="font-bold text-xl mb-4 text-slate-800 flex items-center gap-3">
                                        Point Calculation
                                    </h3>
                                    <p className="text-slate-600 text-sm leading-relaxed mb-6">
                                        Earning points is automatic. For every **HK$1** you spend, we apply your tier multiplier to reward you instantly.
                                    </p>
                                    <div className="p-4 bg-stone-50 rounded-xl border border-stone-100 mb-4">
                                        <div className="text-xs text-slate-400 uppercase tracking-widest mb-2 font-bold">Standard Earning Formula</div>
                                        <div className="text-2xl font-mono font-bold text-indigo-600 flex items-baseline gap-2">
                                            HK$1 <span className="text-stone-300 text-lg">=</span> 10 × <span className="underline decoration-indigo-200">Point Rate</span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-slate-400 text-[11px] italic">
                                    Example: At Gold tier (5%), HK$100 spent = 1,000 × 5% = 50 Points.
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 flex flex-col justify-between"
                            >
                                <div>
                                    <h3 className="font-bold text-xl mb-4 text-slate-800 flex items-center gap-3">
                                        Spending Your Points
                                    </h3>
                                    <p className="text-slate-600 text-sm leading-relaxed mb-6">
                                        Redeem your points anytime during checkout to save on your next purchase. Your points translate directly into cash savings.
                                    </p>
                                    <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100 mb-4">
                                        <div className="text-xs text-amber-600 uppercase tracking-widest mb-2 font-bold">Redemption Value</div>
                                        <div className="text-2xl font-mono font-bold text-slate-900 flex items-baseline gap-2">
                                            10 Points <span className="text-amber-300 text-lg">=</span> HK$1.00
                                        </div>
                                    </div>
                                </div>
                                <p className="text-slate-500 text-[11px] font-medium">
                                    Simply choose &quot;Use Points&quot; at the payment page. It&apos;s that easy!
                                </p>
                            </motion.div>
                        </div>

                        {/* 3. Policy simplified */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100"
                            >
                                <h4 className="font-bold text-lg text-slate-800 mb-3 flex items-center gap-2">
                                    Bronze: Permanent Tier
                                </h4>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    Once you reach Bronze, you are a member for life. There are no expiration dates or annual spending requirements to keep this status.
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100"
                            >
                                <h4 className="font-bold text-lg text-slate-800 mb-3 flex items-center gap-2">
                                    Elite Renewal Policy
                                </h4>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    Silver, Gold, and Diamond tiers are renewed annually. Hit the min. spend each year to stay at your level, or use the 90-day grace period to catch up.
                                </p>
                            </motion.div>
                        </div>

                        <div className="text-center pt-8">
                            <button
                                onClick={() => router.push('/')}
                                className="px-10 py-3 bg-slate-900 text-white font-medium rounded-full hover:bg-slate-800 transition-colors shadow-lg"
                            >
                                Start Your Journey
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
