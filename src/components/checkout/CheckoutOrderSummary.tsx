/**
 * @file line-Item Order breakdown
 * @module components/checkout/CheckoutOrderSummary
 * 
 * renders a detailed summary of cart items during the checkout phase.
 * features specialized promotion highlighting, member-exclusive pricing tags, and original price comparisons.
 */

import React from "react";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import { CartItem } from "@/types/cart";

/** properties for the CheckoutOrderSummary component. */
interface CheckoutOrderSummaryProps {
    /** The list of cart items to display in the summary. */
    items: CartItem[];
}

/**
 * comprehensive order overview.
 * calculates total items and renders each SKU with its specific pricing/promotion metadata.
 */
export default function CheckoutOrderSummary({ items }: CheckoutOrderSummaryProps) {
    return (
        <div className="space-y-12">
            <div className="border-t border-stone-100 pt-8">
                <div className="flex justify-between items-baseline mb-8">
                    <h2 className="font-serif text-2xl text-[#1c1917] tracking-tight">
                        Order Details
                    </h2>
                    <span className="text-stone-400 text-[10px] font-bold tracking-widest uppercase">
                        {items.reduce((acc, item) => acc + item.cartQuantity, 0)} Items
                    </span>
                </div>

                <div className="space-y-8">
                    {items.map((item) => {
                        const hasDiscount = item.discountAmount && item.discountAmount > 0;
                        const itemTotal = item.price * item.cartQuantity;
                        const itemOriginalTotal = item.originalPrice ? item.originalPrice * item.cartQuantity : itemTotal;

                        return (
                            <div key={item.sku} className="flex gap-6 group">
                                <div className="relative w-24 aspect-3/4 bg-stone-50 shrink-0 border border-transparent group-hover:border-stone-200 transition-colors duration-500">
                                    {item.imageUrl ? (
                                        <Image
                                            src={item.imageUrl}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[10px] text-stone-400">No Image</div>
                                    )}
                                </div>
                                <div className="flex-1 space-y-2 py-1">
                                    <h3 className="font-serif text-lg text-[#1c1917] leading-tight group-hover:text-stone-500 transition-colors">{item.name}</h3>
                                    <div className="flex flex-col gap-1">
                                        <p className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">
                                            {item.selectedColor}
                                        </p>
                                        <p className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">
                                            Size: {item.selectedSize}
                                        </p>
                                    </div>
                                    <p className="text-xs text-stone-500 pt-2">Qty: {item.cartQuantity}</p>
                                </div>

                                <div className="text-right py-1 space-y-1">
                                    {hasDiscount ? (
                                        <>
                                            {/* crosses out original price to emphasize the saving. */}
                                            <div className="text-sm text-stone-400 line-through">
                                                {formatCurrency(itemOriginalTotal)}
                                            </div>

                                            {item.promotionBadgeTexts?.some(b => b.toUpperCase().includes("EXCLUSIVE")) && (
                                                <div className="text-[9px] font-bold text-stone-900 uppercase tracking-wider">
                                                    Member Price
                                                </div>
                                            )}

                                            <div className="text-sm font-medium text-[#1c1917] font-serif">
                                                {formatCurrency(itemTotal)}
                                            </div>

                                            {/* displays dynamic discount badges or calculated percentage fallout. */}
                                            <div className="flex flex-wrap gap-1 justify-end">
                                                {item.promotionBadgeTexts && item.promotionBadgeTexts.length > 0 ? (
                                                    item.promotionBadgeTexts.map((badge, idx) => (
                                                        <div key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-bold rounded uppercase tracking-wide">
                                                            {badge}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-bold rounded uppercase tracking-wide">
                                                        {`${((item.discountPercentage || 0) * 100).toFixed(0)}% OFF`}
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-sm font-medium text-[#1c1917] font-serif">
                                            {formatCurrency(itemTotal)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
