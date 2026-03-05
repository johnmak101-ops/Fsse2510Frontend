"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import apiClient from "@/services/api-client";
import { useCartStore } from "@/features/cart/store/useCartStore";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { motion } from "framer-motion";
import { RiVipCrownLine } from "@remixicon/react";
import { Transaction } from "@/types/transaction";
import { getCurrentUser } from "@/services/user.service";
import { UserProfile } from "@/types/user";


const PAYMENT_VERIFICATION_TIMEOUT = 30000;

export default function CheckoutSuccessPage() {
    const searchParams = useSearchParams();
    const tid = searchParams.get("tid");
    const sessionId = searchParams.get("session_id");

    const { isLoading, user, setUser } = useAuthStore();
    const { syncWithServer, clearCart } = useCartStore();
    const [upgradeInfo, setUpgradeInfo] = useState<{ prev: string, next: string } | null>(null);

    // Proactive Clear: Clear old cart upon entering Success Page to ensure a clean UI
    useEffect(() => {
        clearCart();
    }, [clearCart]);

    const hasRunVerification = useRef(false);

    useEffect(() => {
        if (!isLoading && user && tid && !hasRunVerification.current) {
            hasRunVerification.current = true;
            const verifyPayment = async () => {
                try {
                    await apiClient.patch(`/transactions/${tid}/processing`);

                    const endpoint = sessionId
                        ? `/transactions/${tid}/success?session_id=${sessionId}`
                        : `/transactions/${tid}/success`;

                    const transaction = await apiClient.patch<Transaction>(endpoint, undefined, {
                        timeout: PAYMENT_VERIFICATION_TIMEOUT
                    });

                    if (transaction.previousLevel && transaction.newLevel &&
                        transaction.newLevel !== transaction.previousLevel) {
                        setUpgradeInfo({
                            prev: transaction.previousLevel,
                            next: transaction.newLevel
                        });
                    }

                    // ALWAYS refresh Auth Store after purchase to get new points/spending/membership
                    try {
                        const updatedUser = await getCurrentUser();
                        setUser(updatedUser as unknown as UserProfile);
                    } catch (e) {
                        console.error("Failed to refresh user profile", e);
                    }
                } catch (error) {
                    console.error("Payment verification failed", error);
                } finally {
                    await syncWithServer();
                }
            };

            void verifyPayment();
        }
    }, [isLoading, user, tid, sessionId, syncWithServer, setUser]);

    return (
        <div className="container max-w-lg pt-48 pb-32 mx-auto text-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
            >
                {/* Upgrade Celebration */}
                {upgradeInfo && (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="p-6 bg-linear-to-br from-yellow-50 via-yellow-100 to-yellow-50 border border-yellow-200 rounded-3xl shadow-lg mb-8"
                    >
                        <div className="flex justify-center mb-4">
                            <div className="p-3 bg-yellow-400 rounded-full text-white shadow-md">
                                <RiVipCrownLine size={32} />
                            </div>
                        </div>
                        <h2 className="text-xl font-bold text-yellow-900 mb-1">Congratulations!</h2>
                        <p className="text-sm text-yellow-800">
                            Your membership has been upgraded from <span className="font-bold">{upgradeInfo.prev}</span> to <span className="font-bold text-lg">{upgradeInfo.next}</span>!
                        </p>
                        <p className="text-[10px] mt-2 text-yellow-700 uppercase tracking-widest font-bold">Enjoy your new exclusive benefits</p>
                    </motion.div>
                )}

                <div className="flex justify-center">
                    <div className="w-16 h-16 border border-[#5C534E] rounded-full flex items-center justify-center">
                        <span className="font-serif text-2xl text-[#5C534E]">✓</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="font-serif text-3xl md:text-4xl text-[#5C534E] tracking-tight">
                        Thank You
                    </h1>
                    <p className="text-stone-500 text-xs tracking-widest uppercase font-bold">
                        Payment Successful
                    </p>
                </div>

                <div className="py-8 border-t border-b border-stone-100 my-8">
                    <p className="text-sm text-stone-600 leading-relaxed mb-2">
                        Your order {tid && <span className="font-mono text-black">#{tid}</span>} has been confirmed.
                    </p>
                    <p className="text-sm text-stone-600 leading-relaxed">
                        We&apos;ve sent a confirmation email with details.
                        <br />
                        <span className="text-xs text-stone-400 mt-2 block">
                            (If you don&apos;t see it, please check your spam folder or wait a few minutes for payment confirmation)
                        </span>
                    </p>
                </div>

                <div>
                    <Link
                        href="/collections/all"
                        className="inline-block px-12 py-4 border border-stone-200 text-stone-600 hover:border-[#5C534E] hover:text-[#5C534E] hover:bg-stone-50 transition-all font-bold text-[10px] tracking-[0.2em] uppercase rounded-none"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
