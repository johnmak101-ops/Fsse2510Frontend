"use client";

import React, { useEffect, useState, use } from "react"; // Added 'use' for params
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import PaymentWrapper from "@/components/checkout/PaymentWrapper";
import { transactionService } from "@/services/transaction.service";
import { Transaction, PaymentStatus } from "@/types/transaction";
import { formatCurrency } from "@/lib/utils";

export default function PaymentPage({ params }: { params: Promise<{ tid: string }> }) {
    // Unwrap params using React 19 'use' or await if async component (but this is client component)
    // Note: In Next.js 15+ Client Components, params is a Promise.
    const resolvedParams = use(params);
    const tid = resolvedParams.tid;

    const router = useRouter();
    const { user, isLoading: authLoading } = useAuthStore();

    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 1. Auth Guard (Strict)
    useEffect(() => {
        if (!authLoading && !user) {
            // Redirect to login with return URL
            const returnUrl = encodeURIComponent(`/checkout/payment/${tid}`);
            router.push(`/login?redirect=${returnUrl}`);
        }
    }, [authLoading, user, router, tid]);

    // 2. Fetch Transaction
    useEffect(() => {
        if (user && tid) {
            transactionService.getTransaction(tid)
                .then(setTransaction)
                .catch(err => {
                    console.error("Failed to fetch transaction", err);
                    setError("Transaction not found or access denied.");
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

    if (!user) return null; // Logic handled by useEffect, prevent flash

    if (error || !transaction) {
        return (
            <div className="container py-32 text-center bg-white min-h-screen">
                <h1 className="text-3xl font-serif text-[#5C534E] mb-6">Error</h1>
                <p className="text-stone-500 mb-6">{error || "Something went wrong."}</p>
                <button onClick={() => router.push("/account")} className="uppercase tracking-widest text-xs font-bold underline">
                    Return to Dashboard
                </button>
            </div>
        );
    }

    // Determine status
    if (transaction.status === PaymentStatus.SUCCESS) {
        router.replace(`/checkout/success?tid=${tid}`);
        return null;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-24 md:py-32">
            <h1 className="mb-12 text-3xl md:text-4xl font-serif text-[#5C534E] text-center tracking-tight">Complete Payment</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
                {/* Left: Order Details */}
                <div className="space-y-12">
                    <div className="border-t border-stone-100 pt-8">
                        <div className="flex justify-between items-baseline mb-8">
                            <h2 className="font-serif text-2xl text-[#1c1917] tracking-tight">
                                Order Details
                            </h2>
                            <span className="text-stone-400 text-[10px] font-bold tracking-widest uppercase">
                                #{transaction.tid} • {transaction.items.length} Items
                            </span>
                        </div>

                        <div className="space-y-8">
                            {transaction.items.map((item) => (
                                <div key={item.tpid} className="flex gap-6 group">
                                    <div className="relative w-24 aspect-[3/4] bg-stone-50 shrink-0 border border-transparent group-hover:border-stone-200 transition-colors duration-500">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={item.imageUrl}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 space-y-2 py-1">
                                        <h3 className="font-serif text-lg text-[#1c1917] leading-tight group-hover:text-stone-500 transition-colors">{item.name}</h3>
                                        <div className="flex flex-col gap-1">
                                            {item.color && (
                                                <p className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">
                                                    {item.color}
                                                </p>
                                            )}
                                            {item.size && (
                                                <p className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">
                                                    Size: {item.size}
                                                </p>
                                            )}
                                        </div>
                                        <p className="text-xs text-stone-500 pt-2">Qty: {item.quantity}</p>
                                    </div>
                                    <div className="text-sm font-medium text-[#1c1917] font-serif py-1">
                                        {formatCurrency(item.subtotal)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Payment Wrapper */}
                <div className="lg:sticky lg:top-32 h-fit">
                    <div className="bg-white border border-stone-200 p-8 md:p-10 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="font-serif text-3xl text-black uppercase tracking-tight">
                                Payment
                            </h2>
                            <Lock className="w-4 h-4 text-stone-300" />
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-baseline mb-3 border-b border-stone-100 pb-4">
                                <span className="text-stone-300 font-bold text-[11px] tracking-widest uppercase">
                                    Total to Pay
                                </span>
                                <span className="text-black font-serif text-4xl">
                                    {formatCurrency(transaction.total)}
                                </span>
                            </div>
                        </div>

                        <div className="pt-4">
                            <div className="mb-6 text-center">
                                <p className="text-[10px] font-bold tracking-widest text-[#5C534E] uppercase mb-2">Secure Connection Established</p>
                                <div className="h-px w-12 bg-[#5C534E] mx-auto opacity-20"></div>
                            </div>
                            <PaymentWrapper tid={transaction.tid} />
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
