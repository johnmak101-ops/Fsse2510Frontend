/**
 * @file cart Item inventory Alert
 * @module features/cart/components/cart-item/CartItemStockWarning
 * 
 * provides a floating visual warning if the user's requested quantity exceeds current inventory.
 * maintains a high-visibility amber styling for urgent stock notifications.
 */

"use client";

import React from "react";
import { RiErrorWarningLine } from "@remixicon/react";

/** properties for the CartItemStockWarning component. */
interface CartItemStockWarningProps {
    /** user-requested item count. */
    quantity: number;
    /** physical units remaining in stock. */
    stock: number;
}

/** conditional stock warning badge. */
export default function CartItemStockWarning({ quantity, stock }: CartItemStockWarningProps) {
    if (quantity <= stock) return null;

    return (
        <div className="absolute -top-3 left-6 flex items-center gap-2 px-3 py-1 bg-[#FF8A8A] text-white rounded-full text-[10px] font-bold tracking-wider shadow-md">
            <RiErrorWarningLine size={12} />
            Only {stock} left in stock
        </div>
    );
}
