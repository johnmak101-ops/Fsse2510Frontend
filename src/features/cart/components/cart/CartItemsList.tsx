/**
 * @file cart Item List orchestrator
 * @module features/cart/components/cart/CartItemsList
 * 
 * manages the rendering and layout of multiple cart item cards.
 * coordinates AnimatePresence for smooth item removals and re-layouts.
 */

"use client";

import React from "react";
import { AnimatePresence } from "framer-motion";
import { CartItem } from "@/types/cart";
import CartItemCard from "@/features/cart/components/CartItemCard";

/** properties for the CartItemsList component. */
interface CartItemsListProps {
    /** The collection of active cart items to display. */
    items: CartItem[];
    /** total count of individual physical items across all SKUs. */
    totalQuantity: number;
    /** collection of SKUs currently undergoing server-side updates. */
    updatingSkus: Set<string>;
    /** callback for quantity modifications. */
    onUpdateQty: (sku: string, qty: number) => void;
    /** callback for item removal. */
    onRemove: (sku: string) => void;
    /** callback for converting a cart item into a wishlisted item. */
    onSaveForLater: (item: CartItem) => void;
}

/**
 * primary list view for cart items.
 * dynamically calculates keys and handles fallback identities for rendering stability.
 */
export default function CartItemsList({
    items,
    totalQuantity,
    updatingSkus,
    onUpdateQty,
    onRemove,
    onSaveForLater,
}: CartItemsListProps) {
    return (
        <div className="flex-1 space-y-6 md:space-y-8">
            <div className="flex items-baseline justify-between border-b border-stone-100 pb-4 md:pb-6">
                <h1 className="font-serif text-2xl md:text-4xl text-[#5C534E]">Shopping Cart</h1>
                <span className="text-stone-400 text-[10px] font-bold tracking-[0.2em] uppercase">
                    {totalQuantity} Items
                </span>
            </div>

            <div className="space-y-4 md:space-y-6">
                <AnimatePresence mode="popLayout">
                    {items.map((item, index) => (
                        <CartItemCard
                            key={item.sku || `fallback-${item.pid}-${index}`}
                            item={item}
                            onUpdateQty={onUpdateQty}
                            onRemove={onRemove}
                            onSaveForLater={() => onSaveForLater(item)}
                            isCheckingStock={updatingSkus.has(item.sku)}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
