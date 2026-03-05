/**
 * @file empty bag UX
 * @module features/cart/components/cart/CartEmptyState
 * 
 * renders a premium, minimalist 'Empty Bag' state with a clear call-to-action.
 * intended to encourage users to explore new arrivals when their cart session is empty.
 */

"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

/** global empty state UI for the cart page. */
export default function CartEmptyState() {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-10 px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-px h-24 bg-black/10 mb-4"
            />
            <div className="text-center space-y-6">
                <h1 className="font-serif text-5xl text-black tracking-tight">Your bag is empty</h1>
                <p className="text-stone-400 font-bold text-[10px] tracking-[0.3em] uppercase">
                    Explore our new collections to find your favorites.
                </p>
            </div>
            <Link href="/collections/all">
                <motion.button
                    whileHover={{ backgroundColor: "#333" }}
                    whileTap={{ scale: 0.98 }}
                    className="px-12 py-5 bg-black text-white font-bold tracking-[0.4em] rounded-none uppercase text-[10px] transition-all shadow-xl shadow-black/10"
                >
                    Shop All Arrivals
                </motion.button>
            </Link>
        </div>
    );
}
