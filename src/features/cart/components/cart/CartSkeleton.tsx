/**
 * @file structural cart Skeleton
 * @module features/cart/components/cart/CartSkeleton
 * 
 * provides a low-fidelity visual representation of the cart page during initial data fetching.
 * mirrors the layout of CartItemsList and CartOrderSummary to prevent layout shifts.
 */

"use client";

import React from "react";

/** pulse-based loading skeleton for the cart page. */
export default function CartSkeleton() {
    return (
        <div className="max-w-7xl mx-auto px-4 pt-32 pb-20 lg:px-8 animate-pulse">
            <div className="flex flex-col lg:flex-row gap-12">

                {/* Left: Items List Skeleton */}
                <div className="flex-1 space-y-8">
                    {/* Header */}
                    <div className="flex items-baseline justify-between border-b border-stone-100 pb-6">
                        <div className="h-10 w-48 bg-stone-200/50 rounded-sm" />
                        <div className="h-4 w-20 bg-stone-100 rounded-sm" />
                    </div>

                    {/* Items */}
                    <div className="space-y-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex gap-8 p-8 border border-stone-50">
                                {/* Image Skeleton */}
                                <div className="w-[120px] h-[150px] bg-stone-200/50 shrink-0" />

                                <div className="flex-1 flex flex-col pt-2">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="space-y-3 w-full">
                                            {/* Title */}
                                            <div className="h-6 w-3/4 bg-stone-200/50 rounded-sm" />
                                            {/* Subtitles (Color/Size) */}
                                            <div className="h-4 w-1/3 bg-stone-100 rounded-sm" />
                                            <div className="h-4 w-1/4 bg-stone-100 rounded-sm" />
                                        </div>
                                        {/* Price */}
                                        <div className="h-6 w-20 bg-stone-200/50 rounded-sm" />
                                    </div>

                                    <div className="mt-auto flex items-center justify-between pb-2">
                                        {/* Quantity Pill */}
                                        <div className="h-10 w-32 bg-stone-100 rounded-full" />
                                        {/* Actions */}
                                        <div className="flex gap-4">
                                            <div className="h-4 w-16 bg-stone-100 rounded-sm" />
                                            <div className="h-4 w-16 bg-stone-100 rounded-sm" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Summary Skeleton */}
                <div className="w-full lg:w-[400px] shrink-0">
                    <div className="bg-stone-50/50 p-8 sticky top-32 space-y-8">
                        <div className="h-8 w-32 bg-stone-200/50 rounded-sm mb-8" />

                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <div className="h-4 w-20 bg-stone-100" />
                                <div className="h-4 w-20 bg-stone-100" />
                            </div>
                            <div className="flex justify-between">
                                <div className="h-4 w-24 bg-stone-100" />
                                <div className="h-4 w-20 bg-stone-100" />
                            </div>
                        </div>

                        <div className="border-t border-stone-200/50 pt-6">
                            <div className="flex justify-between items-baseline mb-8">
                                <div className="h-5 w-16 bg-stone-200/50" />
                                <div className="h-8 w-32 bg-stone-200/50" />
                            </div>
                            {/* Checkout Button */}
                            <div className="h-14 w-full bg-stone-800/10 rounded-none" />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
