/**
 * @file individual cart Item representation
 * @module features/cart/components/CartItemCard
 * 
 * renders a detailed product card within the cart listing.
 * features specialized layouts for mobile (stacked) and desktop (horizontal) to maintain premium spacing.
 * integrates inline quantity management and stock status indicators.
 */

"use client";

import React from "react";
import { motion } from "framer-motion";
import { CartItem } from "@/types/cart";
import CartItemImage from "./cart-item/CartItemImage";
import CartItemInfo from "./cart-item/CartItemInfo";
import CartItemPrice from "./cart-item/CartItemPrice";
import CartItemQuantity from "./cart-item/CartItemQuantity";
import CartItemActions from "./cart-item/CartItemActions";
import CartItemStockWarning from "./cart-item/CartItemStockWarning";

/** properties for the CartItemCard component. */
interface CartItemCardProps {
    /** The Cart item domain object containing pricing and product details. */
    item: CartItem;
    /** callback triggered when the user modifies item quantity. */
    onUpdateQty: (sku: string, qty: number) => void;
    /** callback triggered when the user removes the item from the cart. */
    onRemove: (sku: string) => void;
    /** placeholder for future Save for Later functionality. */
    onSaveForLater: () => void;
    /** flag indicating if global stock verification is in progress. */
    isCheckingStock: boolean;
}

/**
 * atomic cart item component.
 * uses Framer Motion for entrance and exit animations.
 */
export default function CartItemCard({
    item,
    onUpdateQty,
    onRemove,
    onSaveForLater,
    isCheckingStock,
}: CartItemCardProps) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="group relative flex flex-col md:flex-row gap-3 md:gap-8 p-4 md:p-8 bg-white border border-stone-100 rounded-none hover:border-stone-300 transition-all duration-500"
        >
            {/* MOBILE LAYOUT: Two-Row Design */}
            <div className="flex flex-col gap-3 md:hidden">
                {/* Row 1: Image + Product Info + Price */}
                <div className="flex gap-3">
                    <CartItemImage item={item} />

                    <div className="flex-1 flex flex-col">
                        <CartItemInfo item={item} />
                    </div>

                    {/* Price - Top Right */}
                    <div className="flex-shrink-0">
                        <CartItemPrice
                            price={item.price}
                            originalPrice={item.originalPrice}
                            discountAmount={item.discountAmount}
                            discountPercentage={item.discountPercentage}
                            promotionBadgeTexts={item.promotionBadgeTexts}
                        />
                    </div>
                </div>

                {/* Row 2: Quantity + Remove Button */}
                <div className="flex justify-between items-center pt-2 border-t border-stone-100">
                    <CartItemQuantity
                        quantity={item.cartQuantity}
                        stock={item.stock}
                        sku={item.sku}
                        isCheckingStock={isCheckingStock}
                        onUpdateQty={onUpdateQty}
                    />

                    <CartItemActions
                        sku={item.sku}
                        onRemove={onRemove}
                        onSaveForLater={onSaveForLater}
                    />
                </div>
            </div>

            {/* DESKTOP LAYOUT: Original Horizontal Design */}
            <div className="hidden md:flex md:flex-1 md:gap-8">
                <CartItemImage item={item} />

                <div className="flex-1 flex flex-col pt-2">
                    <div className="flex justify-between items-start mb-6">
                        <CartItemInfo item={item} />

                        <CartItemPrice
                            price={item.price}
                            originalPrice={item.originalPrice}
                            discountAmount={item.discountAmount}
                            discountPercentage={item.discountPercentage}
                            promotionBadgeTexts={item.promotionBadgeTexts}
                        />
                    </div>

                    <div className="mt-auto flex items-center justify-between pb-2">
                        <CartItemQuantity
                            quantity={item.cartQuantity}
                            stock={item.stock}
                            sku={item.sku}
                            isCheckingStock={isCheckingStock}
                            onUpdateQty={onUpdateQty}
                        />

                        <CartItemActions
                            sku={item.sku}
                            onRemove={onRemove}
                            onSaveForLater={onSaveForLater}
                        />
                    </div>
                </div>
            </div>

            {/* Stock Warning Badge */}
            <CartItemStockWarning quantity={item.cartQuantity} stock={item.stock} />
        </motion.div>
    );
}
