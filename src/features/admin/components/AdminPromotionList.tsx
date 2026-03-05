/**
 * @file central Promotion management board
 * @module features/admin/components/AdminPromotionList
 * 
 * renders a comprehensive dashboard for all marketing promotions and seasonal discounts.
 * features real-time status derived from date ranges (Scheduled vs Active vs Expired).
 * integrates with `promotionService` for administrative data synchronization and deletions.
 */

"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Promotion, promotionService } from "@/services/promotion.service";
import Link from "next/link";
import AdminLoadingState from "@/features/admin/components/AdminLoadingState";

/** 
 * administrative promotional control center. 
 * maintains list state and handles deletions with UI feedback.
 */
export default function AdminPromotionList() {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    useEffect(() => {
        loadPromotions();
    }, []);

    const loadPromotions = async () => {
        try {
            const data = await promotionService.getAllPromotions();
            setPromotions(data);
        } catch (error) {
            console.error("Failed to load promotions", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this promotion?")) {
            setDeletingId(id);
            try {
                await promotionService.deletePromotion(id);
                await loadPromotions();
            } catch (error) {
                console.error("Failed to delete promotion", error);
            } finally {
                setDeletingId(null);
            }
        }
    };

    if (loading) return <AdminLoadingState message="Loading promotions..." />;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-serif font-bold tracking-tight text-stone-900">Promotions</h1>
                <Link
                    href="/admin/promotions/new"
                    className="px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors font-medium text-sm"
                >
                    Create Promotion
                </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                <table className="w-full text-sm text-left border-collapse">
                    <thead>
                        <tr className="bg-stone-50/50 border-b border-stone-100">
                            <th className="px-8 py-5 font-bold text-stone-900 uppercase tracking-widest text-[10px]">Promotion</th>
                            <th className="px-6 py-5 font-bold text-stone-900 uppercase tracking-widest text-[10px]">Type</th>
                            <th className="px-6 py-5 font-bold text-stone-900 uppercase tracking-widest text-[10px]">Discount</th>
                            <th className="px-6 py-5 font-bold text-stone-900 uppercase tracking-widest text-[10px]">Status</th>
                            <th className="px-6 py-5 font-bold text-stone-900 uppercase tracking-widest text-[10px]">Date Range</th>
                            <th className="px-8 py-5 font-bold text-stone-900 uppercase tracking-widest text-[10px] text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {promotions.map((promo) => {
                            const now = new Date();
                            const startDate = new Date(promo.startDate);
                            const endDate = new Date(promo.endDate);
                            let status = "Active";
                            let statusColor = "bg-emerald-50 text-emerald-700 border-emerald-100";

                            if (now < startDate) {
                                status = "Scheduled";
                                statusColor = "bg-amber-50 text-amber-700 border-amber-100";
                            } else if (now > endDate) {
                                status = "Expired";
                                statusColor = "bg-stone-100 text-stone-500 border-stone-200";
                            }

                            return (
                                <tr key={promo.id} className="group hover:bg-stone-50/50 transition-all">
                                    <td className="px-8 py-6">
                                        <div className="font-semibold text-stone-900 text-base mb-1">{promo.name}</div>
                                        <div className="text-stone-400 text-xs line-clamp-1">{promo.description || "No description"}</div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <span className="px-2 py-1 bg-stone-100 text-stone-600 rounded-md text-[11px] font-bold border border-stone-200 uppercase tracking-wider">
                                            {promo.type.replace("_", " ")}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6">
                                        {promo.discountType === "PERCENTAGE" ? (
                                            <div className="flex flex-col">
                                                <span className="text-stone-900 font-bold text-lg">{promo.discountValue}%</span>
                                                <span className="text-stone-400 text-[10px] uppercase font-semibold">Discount</span>
                                            </div>
                                        ) : promo.discountType === "FIXED" ? (
                                            <div className="flex flex-col">
                                                <span className="text-stone-900 font-bold text-lg">-${promo.discountValue}</span>
                                                <span className="text-stone-400 text-[10px] uppercase font-semibold">Fixed Amount</span>
                                            </div>
                                        ) : (
                                            <span className="text-stone-400 italic">N/A</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-6">
                                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusColor} uppercase tracking-tight`}>
                                            {status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6 font-medium text-stone-600">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="w-8 text-[10px] text-stone-400 font-bold uppercase">From</span>
                                                <span>{format(new Date(promo.startDate), "MMM d, yyyy")}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-stone-400">
                                                <span className="w-8 text-[10px] font-bold uppercase">To</span>
                                                <span>{format(new Date(promo.endDate), "MMM d, yyyy")}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link
                                                href={`/admin/promotions/${promo.id}`}
                                                className="text-stone-400 hover:text-stone-900 font-bold text-xs uppercase tracking-widest transition-colors"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(promo.id)}
                                                disabled={deletingId === promo.id}
                                                className={`font-bold text-xs uppercase tracking-widest transition-colors ${deletingId === promo.id
                                                    ? "text-stone-300 cursor-not-allowed"
                                                    : "text-stone-400 hover:text-red-600"
                                                    }`}
                                            >
                                                {deletingId === promo.id ? "Deleting..." : "Delete"}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {promotions.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-8 py-20 text-center">
                                    <div className="text-stone-300 font-serif text-xl italic mb-2">No promotions found</div>
                                    <div className="text-stone-400 text-sm">Create your first promotion to boost your sales.</div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
