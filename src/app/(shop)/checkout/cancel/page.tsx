"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { transactionService } from "@/services/transaction.service";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { motion } from "framer-motion";
import { RiCloseCircleLine, RiLoader4Line } from "@remixicon/react";

export default function CheckoutCancelPage() {
    const searchParams = useSearchParams();
    const tid = searchParams.get("tid");
    const { isLoading: authLoading, user } = useAuthStore();
    const [isAborting, setIsAborting] = useState(true);

    useEffect(() => {
        if (!authLoading && user && tid) {
            const performAbort = async () => {
                try {
                    await transactionService.abortTransaction(tid);
                } catch (error) {
                    console.error("Failed to abort transaction", error);
                } finally {
                    setIsAborting(false);
                }
            };

            void performAbort();
        } else if (!authLoading && !user) {
            // If not logged in, just stop loading
            setIsAborting(false);
        }
    }, [authLoading, user, tid]);

    return (
        <div className="container max-w-lg pt-48 pb-32 mx-auto text-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
            >
                <div className="flex justify-center text-stone-300">
                    {isAborting ? (
                        <RiLoader4Line size={64} className="animate-spin" />
                    ) : (
                        <RiCloseCircleLine size={64} />
                    )}
                </div>

                <div className="space-y-4">
                    <h1 className="font-serif text-3xl md:text-4xl text-[#5C534E] tracking-tight">
                        Order Cancelled
                    </h1>
                    <p className="text-stone-500 text-xs tracking-widest uppercase font-bold">
                        Transaction Aborted
                    </p>
                </div>

                <div className="py-8 border-t border-b border-stone-100 my-8">
                    <p className="text-sm text-stone-600 leading-relaxed mb-4">
                        We&apos;ve cancelled your transaction {tid && <span className="font-mono text-black">#{tid}</span>} as requested.
                    </p>
                    <p className="text-sm text-stone-600 leading-relaxed">
                        Don&apos;t worry, no payment was processed. Your items are still saved in your bag.
                    </p>
                </div>

                <div className="flex flex-col gap-4">
                    <Link
                        href="/cart"
                        className="inline-block px-12 py-4 bg-[#5C534E] text-white hover:bg-black transition-all font-bold text-[10px] tracking-[0.2em] uppercase rounded-none"
                    >
                        Return to Bag
                    </Link>
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
