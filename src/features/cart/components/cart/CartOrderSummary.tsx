/**
 * @file cart financial overview
 * @module features/cart/components/cart/CartOrderSummary
 * 
 * presents a detailed breakdown of subtotal, promotional savings, and final estimated total.
 * primary call-to-action for navigating the user from the cart into the checkout flow.
 */

"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { RiCheckboxCircleLine } from "@remixicon/react";

/** properties for the CartOrderSummary component. */
interface CartOrderSummaryProps {
    /** The final calculated price after all promotions are applied. */
    totalPrice: number;
    /** The combined original MSRP of all items in the cart. */
    totalOriginalPrice: number;
    /** status flag indicating if the cart is currently performing server-side synchronization. */
    isCartSyncing: boolean;
    /** triggers the final checkout transition. */
    onCheckout: () => void;
}

/**
 * responsive order summary sidebar.
 * Sticky on desktop to maintain visibility during long cart scrolls.
 */
export default function CartOrderSummary({
    totalPrice,
    totalOriginalPrice,
    isCartSyncing,
    onCheckout,
}: CartOrderSummaryProps) {
    const totalSavings = Math.round((totalOriginalPrice - totalPrice) * 100) / 100;
    const hasSavings = totalSavings > 0;

    return (
        <div className="lg:w-[400px]">
            <div className="bg-white border border-stone-200 rounded-none p-8 md:p-10 sticky top-24">
                <h2 className="font-serif text-3xl text-black mb-8 uppercase tracking-tight">
                    Order Summary
                </h2>

                <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-stone-400 text-[11px] font-bold tracking-widest uppercase">
                        <span>Subtotal</span>
                        <span className="text-black">${totalOriginalPrice.toFixed(2)}</span>
                    </div>

                    {hasSavings && (
                        <div className="flex justify-between text-rose-500 text-[11px] font-bold tracking-widest uppercase">
                            <span>Promotion Savings</span>
                            <span>-${totalSavings.toFixed(2)}</span>
                        </div>
                    )}

                    <div className="flex justify-between text-stone-400 text-[11px] font-bold tracking-widest uppercase">
                        <span>Shipping</span>
                        <span className="text-black">FREE</span>
                    </div>


                    <div className="pt-6" />
                </div>

                <div className="border-t border-stone-100 pt-8 mb-10">
                    <div className="flex justify-between items-baseline mb-3">
                        <span className="text-stone-300 font-bold text-[11px] tracking-widest uppercase">
                            Total
                        </span>
                        <span className="text-black font-serif text-4xl">
                            ${totalPrice.toFixed(2)}
                        </span>
                    </div>
                    <p className="text-[9px] text-stone-300 font-bold tracking-[0.2em] uppercase leading-relaxed">
                        Shipping & taxes calculated at checkout.
                    </p>
                </div>

                <motion.button
                    onClick={onCheckout}
                    whileHover={!isCartSyncing ? { backgroundColor: "#333" } : {}}
                    whileTap={!isCartSyncing ? { scale: 0.99 } : {}}
                    disabled={isCartSyncing}
                    className={cn(
                        "w-full py-6 font-bold tracking-[0.4em] rounded-none uppercase text-[10px] transition-all mb-6 flex items-center justify-center gap-3",
                        isCartSyncing
                            ? "bg-stone-100 text-stone-300 cursor-not-allowed"
                            : "bg-black text-white shadow-lg shadow-black/10"
                    )}
                >
                    {isCartSyncing ? (
                        <>
                            <span className="w-4 h-4 border-2 border-stone-300 border-t-stone-500 rounded-full animate-spin" />
                            Updating...
                        </>
                    ) : (
                        "Secure Checkout"
                    )}
                </motion.button>

                <div className="flex items-center justify-center gap-2 text-[#BAB3AE]">
                    <RiCheckboxCircleLine size={16} />
                    <span className="text-[10px] font-bold tracking-widest uppercase">
                        Secure Transaction
                    </span>
                </div>
            </div>
        </div>
    );
}
