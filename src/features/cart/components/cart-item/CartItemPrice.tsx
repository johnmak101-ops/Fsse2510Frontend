/**
 * @file cart Item pricing display
 * @module features/cart/components/cart-item/CartItemPrice
 * 
 * renders hierarchical pricing information for a cart item, including MSRP and discounted totals.
 * dynamically highlights member-exclusive pricing and promotional badges.
 */

"use client";

import React from "react";

/** properties for the CartItemPrice component. */
interface CartItemPriceProps {
    /** The final unit price after discounts. */
    price: number;
    /** The original MSRP or list price. */
    originalPrice?: number;
    /** amount of currency saved per unit. */
    discountAmount?: number;
    /** percentage of currency saved. */
    discountPercentage?: number;
    /** collection of human-readable promotion descriptions. */
    promotionBadgeTexts?: string[];
}

/** adaptive pricing component. */
export default function CartItemPrice({
    price,
    originalPrice,
    discountAmount,
    discountPercentage,
    promotionBadgeTexts,
}: CartItemPriceProps) {
    const hasDiscount = discountAmount && discountAmount > 0;
    const isMemberExclusive = promotionBadgeTexts?.some((badge) =>
        badge.toUpperCase().includes("EXCLUSIVE")
    );

    return (
        <div className="text-right space-y-0.5">
            {hasDiscount ? (
                <>
                    {/* Original price (crossed out) */}
                    <div className="text-xs md:text-sm text-stone-400 line-through">
                        ${originalPrice?.toFixed(2)}
                    </div>

                    {/* Member Price label (exclusive promotions) */}
                    {isMemberExclusive && (
                        <div className="text-[9px] md:text-[10px] font-bold text-stone-900 uppercase tracking-wider">
                            Member Price
                        </div>
                    )}

                    {/* Final price */}
                    <div className="text-base md:text-lg font-medium text-[#5C534E]">
                        ${price.toFixed(2)}
                    </div>

                    {/* Discount badges */}
                    <div className="flex flex-wrap items-center gap-1.5 justify-end">
                        {promotionBadgeTexts && promotionBadgeTexts.length > 0 ? (
                            promotionBadgeTexts.map((badge, index) => (
                                <div
                                    key={index}
                                    className="inline-flex items-center px-1.5 md:px-2 py-0.5 bg-red-50 text-red-600 text-[10px] md:text-xs font-medium rounded"
                                >
                                    {badge}
                                </div>
                            ))
                        ) : (
                            <div className="inline-flex items-center px-1.5 md:px-2 py-0.5 bg-red-50 text-red-600 text-[10px] md:text-xs font-medium rounded">
                                {discountPercentage ? `${(discountPercentage * 100).toFixed(0)}% OFF` : "SALE"}
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="text-base md:text-lg font-medium text-[#5C534E]">
                    ${price.toFixed(2)}
                </div>
            )}
        </div>
    );
}
