/**
 * @file cart Item interaction controls
 * @module features/cart/components/cart-item/CartItemActions
 * 
 * provides functional triggers for individual cart item mutations, such as removal and saving for later.
 * maintains specialized styling for desktop and mobile action rows.
 */

"use client";

import React from "react";
import { RiDeleteBinLine, RiHeartLine } from "@remixicon/react";

/** properties for the CartItemActions component. */
interface CartItemActionsProps {
    /** The SKU of the item to perform actions on. */
    sku: string;
    /** callback triggered when the user requests removal. */
    onRemove: (sku: string) => void;
    /** placeholder for future wishlist integration. */
    onSaveForLater: () => void;
}

/** atomic action row for cart items. */
export default function CartItemActions({ sku, onRemove, onSaveForLater }: CartItemActionsProps) {
    return (
        <div className="flex gap-8">
            {/* Save for Later - Desktop only */}
            <button
                onClick={onSaveForLater}
                className="hidden md:flex items-center gap-2.5 text-[9px] font-bold tracking-[0.3em] uppercase text-stone-300 hover:text-black transition-colors"
            >
                <RiHeartLine size={14} />
                <span className="border-b border-transparent hover:border-black/20 pb-0.5">
                    Save
                </span>
            </button>

            {/* Remove Button */}
            <button
                onClick={() => onRemove(sku)}
                className="flex items-center gap-2 text-[9px] md:text-[9px] font-bold tracking-[0.3em] uppercase text-red-500 md:text-stone-300 hover:text-red-600 md:hover:text-black transition-colors"
            >
                <RiDeleteBinLine size={14} className="hidden md:block" />
                <span className="md:border-b md:border-transparent md:hover:border-black/20 pb-0.5">
                    Remove
                </span>
            </button>
        </div>
    );
}
