/**
 * @file individual Order Detail Page
 * @module app/(account)/account/orders/[tid]/page
 * 
 * displays granular information for a specific transaction.
 * implements a client-side auth guard and redirects unauthenticated users to login with return pathing.
 * provides status-aware styling and breakdown of order items and financial summaries.
 */

"use client";

import React, { useEffect, useState, use } from "react";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import { transactionService } from "@/services/transaction.service";
import { Transaction, PaymentStatus } from "@/types/transaction";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { format } from "date-fns";

/** 
 * visual view for a user's specific transaction. 
 * orchestrates data fetching for order entities and manages error states for invalid IDs or permission issues.
 */
export default function OrderDetailsPage({ params }: { params: Promise<{ tid: string }> }) {
    const resolvedParams = use(params);
    const tid = resolvedParams.tid;

    const router = useRouter();
    const { user, isLoading: authLoading } = useAuthStore();

    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 1. Auth Guard
    useEffect(() => {
        if (!authLoading && !user) {
            router.push(`/login?redirect=${encodeURIComponent(`/account/orders/${tid}`)}`);
        }
    }, [authLoading, user, router, tid]);

    // 2. Fetch Transaction
    useEffect(() => {
        if (user && tid) {
            transactionService.getTransaction(tid)
                .then(setTransaction)
                .catch(err => {
                    console.error("Failed to fetch transaction", err);
                    setError("Order not found or access denied.");
                })
                .finally(() => setLoading(false));
        }
    }, [user, tid]);

    if (authLoading || loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-white">
                <Loader2 className="h-8 w-8 animate-spin text-stone-300" />
            </div>
        );
    }

    if (!user) return null;

    if (error || !transaction) {
        return (
            <div className="container py-32 text-center bg-white min-h-screen">
                <p className="text-stone-500 mb-6">{error || "Something went wrong."}</p>
                <Link href="/account" className="uppercase tracking-widest text-xs font-bold underline">
                    Return to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 lg:px-8 py-12 md:py-16">
            {/* Header */}
            <div className="mb-8">
                <Link href="/account" className="inline-flex items-center text-stone-400 hover:text-black mb-6 transition-colors text-xs font-bold tracking-widest uppercase">
                    <ArrowLeft className="w-3 h-3 mr-2" /> Back to Orders
                </Link>
                <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-serif text-[#1c1917] mb-2">Order #{transaction.tid}</h1>
                        <p className="text-stone-500 text-sm">
                            Placed on {format(new Date(transaction.datetime), "PPP")}
                        </p>
                    </div>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest
                        ${transaction.status === PaymentStatus.SUCCESS ? 'bg-emerald-100 text-emerald-700' :
                            transaction.status === PaymentStatus.PENDING ? 'bg-yellow-100 text-yellow-700' : 'bg-stone-100 text-stone-500'}`}>
                        {transaction.status}
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-stone-100 pt-12">

                {/* Left Col: Items (Span 2) */}
                <div className="md:col-span-2 space-y-8">
                    <h2 className="font-serif text-xl">Items</h2>
                    <div className="space-y-6">
                        {transaction.items.map((item) => (
                            <div key={item.tpid} className="flex gap-6 group">
                                <div className="relative w-20 aspect-3/4 bg-stone-50 shrink-0 border border-transparent">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={item.imageUrl}
                                        alt={item.name}
                                        className="w-full h-full object-cover mix-blend-multiply"
                                    />
                                </div>
                                <div className="flex-1 py-1">
                                    <h3 className="font-serif text-base text-[#1c1917] leading-tight mb-1">{item.name}</h3>
                                    <div className="flex flex-col gap-1 mb-2">
                                        <p className="text-[10px] text-stone-400 uppercase tracking-wider">
                                            Qty: {item.quantity}
                                        </p>
                                    </div>
                                    <div className="text-sm font-medium text-[#1c1917] font-serif">
                                        {formatCurrency(item.subtotal)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Col: Summary */}
                <div className="space-y-8">
                    <div className="bg-stone-50 p-6 rounded-lg space-y-4">
                        <h2 className="font-serif text-lg mb-4">Summary</h2>

                        <div className="flex justify-between text-sm text-stone-600">
                            <span>Subtotal</span>
                            <span>{formatCurrency(transaction.total)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-stone-600">
                            <span>Shipping</span>
                            <span>Free</span>
                        </div>

                        <div className="border-t border-stone-200 pt-4 mt-4 flex justify-between items-baseline">
                            <span className="font-bold text-sm uppercase tracking-wider">Total</span>
                            <span className="font-serif text-2xl">{formatCurrency(transaction.total)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
