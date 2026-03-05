/**
 * @file user Transaction History List
 * @module features/account/components/AccountTransactionList
 * 
 * displays a chronological list of user orders and their current fulfillment/payment statuses.
 * implements reactive auto-polling logic to track "PROCESSING" transactions in real-time.
 * provides status-aware navigation for pending payments or order detail viewing.
 */

"use client";

import { useEffect, useState } from "react";
import { Transaction, PaymentStatus } from "@/types/transaction";
import { transactionService } from "@/services/transaction.service";
import { RiShoppingBag3Line, RiTimeLine, RiArrowRightLine } from "@remixicon/react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

/** 
 * specialized component for monitoring order lifecycle. 
 * maintains an interval-based refresh loop while active "PROCESSING" states exist to ensure UI eventual consistency.
 */
export default function AccountTransactionList() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTransactions = () => {
        transactionService.getTransactions()
            .then(setTransactions)
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    // Auto-polling Logic
    useEffect(() => {
        const hasProcessing = transactions.some(t => t.status === PaymentStatus.PROCESSING);

        if (!hasProcessing) return;

        const intervalId = setInterval(() => {
            transactionService.getTransactions()
                .then(setTransactions)
                .catch(console.error);
        }, 3000);

        return () => clearInterval(intervalId);
    }, [transactions]);

    if (loading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white border border-stone-100 rounded-xl p-6 h-32 animate-pulse" />
                ))}
            </div>
        );
    }

    if (transactions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-16 border border-dashed border-stone-200 rounded-2xl bg-stone-50/50 text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                    <RiShoppingBag3Line size={24} className="text-stone-300" />
                </div>
                <h3 className="text-lg font-serif text-stone-800 mb-2">No orders yet</h3>
                <p className="text-stone-500 text-xs mb-6 max-w-xs mx-auto leading-relaxed">
                    Start exploring our collections and find something cozy for yourself.
                </p>
                <Link href="/collections/all" className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-stone-700 transition-colors">
                    Start Shopping
                </Link>
            </div>
        );
    }

    // Sort by date desc
    const sorted = [...transactions].sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());

    return (
        <div className="space-y-6">
            {sorted.map((t) => (
                <div key={t.tid} className="group bg-white border border-stone-100/80 rounded-xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-stone-200/40 hover:border-stone-200 relative overflow-hidden">
                    {/* Status accent bar */}
                    <div className={cn(
                        "absolute left-0 top-0 bottom-0 w-1",
                        t.status === PaymentStatus.SUCCESS && "bg-emerald-500",
                        t.status === PaymentStatus.PENDING && "bg-amber-400",
                        t.status === PaymentStatus.PROCESSING && "bg-blue-500",
                        (t.status === PaymentStatus.FAILED || t.status === PaymentStatus.ABORTED) && "bg-red-400"
                    )} />

                    <div className="flex flex-col md:grid md:grid-cols-12 gap-5 md:gap-6 items-start md:items-center pl-3">

                        {/* 1. Order Info & Status */}
                        <div className="w-full md:col-span-3 space-y-2.5 md:space-y-3">
                            <div className="flex items-center justify-between md:justify-start gap-3">
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        "px-2 py-0.5 md:px-2.5 md:py-1 rounded-md text-[8px] md:text-[9px] font-bold uppercase tracking-wider border",
                                        t.status === PaymentStatus.SUCCESS && "bg-emerald-50 border-emerald-100 text-emerald-700",
                                        t.status === PaymentStatus.PENDING && "bg-amber-50 border-amber-100 text-amber-700",
                                        t.status === PaymentStatus.PROCESSING && "bg-blue-50 border-blue-100 text-blue-700 animate-pulse",
                                        (t.status === PaymentStatus.FAILED || t.status === PaymentStatus.ABORTED) && "bg-red-50 border-red-100 text-red-700"
                                    )}>
                                        {t.status}
                                    </span>
                                    <span className="font-mono text-[10px] md:text-xs text-stone-400">#{t.tid}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-stone-400 md:hidden">
                                    <RiTimeLine size={12} />
                                    <span className="text-[10px] font-sans">{format(new Date(t.datetime), "MMM d, yyyy")}</span>
                                </div>
                            </div>
                            <div className="hidden md:flex items-center gap-2 text-stone-400">
                                <RiTimeLine size={14} />
                                <span className="text-xs font-medium font-sans">{format(new Date(t.datetime), "PPP")}</span>
                            </div>
                        </div>

                        {/* 2. Items Preview (Thumbnails) */}
                        <div className="w-full md:col-span-5 flex items-center gap-3 overflow-hidden">
                            <div className="flex -space-x-2 md:-space-x-3 hover:space-x-1 transition-all duration-300 py-1 md:py-2 pl-0.5">
                                {t.items.slice(0, 4).map((item, idx) => (
                                    <div key={idx} className="relative w-10 h-10 md:w-12 md:h-12 rounded-lg border-2 border-white shadow-sm overflow-hidden bg-stone-50 flex-shrink-0 transition-transform hover:scale-110 hover:z-10">
                                        <Image
                                            src={item.imageUrl || "/placeholder.png"}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 40px, 48px"
                                        />
                                    </div>
                                ))}
                                {t.items.length > 4 && (
                                    <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-lg border-2 border-white shadow-sm bg-stone-100 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-stone-500 z-0">
                                        +{t.items.length - 4}
                                    </div>
                                )}
                            </div>
                            {t.items.length === 0 && (
                                <span className="text-xs text-stone-400 italic">No items</span>
                            )}
                        </div>

                        {/* 3. Total Amount */}
                        <div className="w-full md:col-span-2 flex md:flex-col justify-between md:justify-center items-center md:items-end">
                            <div className="text-[10px] md:text-xs text-stone-400 uppercase tracking-widest font-bold md:mb-1">Total Amount</div>
                            <div className="text-base md:text-lg font-serif font-medium text-stone-900">
                                ${t.total.toFixed(2)}
                            </div>
                        </div>

                        {/* 4. Actions */}
                        <div className="w-full md:col-span-2 flex justify-end pt-2 md:pt-0">
                            {t.status === PaymentStatus.PENDING ? (
                                <Link
                                    href={`/checkout/payment/${t.tid}`}
                                    className="w-full md:w-auto text-center group/btn relative overflow-hidden rounded-full bg-stone-900 px-6 py-2.5 text-white shadow transition-all hover:bg-stone-800 hover:shadow-lg"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em]">
                                        Pay Now <RiArrowRightLine size={12} />
                                    </span>
                                </Link>
                            ) : (
                                <Link
                                    href={`/account/orders/${t.tid}`}
                                    className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-stone-200 bg-white text-stone-600 hover:text-stone-900 hover:border-stone-900 transition-all duration-300"
                                >
                                    <span className="text-[10px] font-bold uppercase tracking-[0.15em]">Details</span>
                                    <RiArrowRightLine size={12} className="transition-transform group-hover/btn:translate-x-0.5" />
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
