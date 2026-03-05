/**
 * @file cart Item metadata display
 * @module features/cart/components/cart-item/CartItemInfo
 * 
 * renders primary product identifiers including name, size, and color within the cart listing.
 * provides direct navigational links to the product detail page.
 */

"use client";

import React from "react";
import { CartItem } from "@/types/cart";
import Link from "next/link";

/** properties for the CartItemInfo component. */
interface CartItemInfoProps {
    /** The cart item containing descriptive metadata. */
    item: CartItem;
}

/** textual information block for cart items. */
export default function CartItemInfo({ item }: CartItemInfoProps) {
    return (
        <div className="space-y-1 md:space-y-3">
            <Link href={`/product/${item.slug || item.pid}`} className="hover:text-stone-600 transition-colors block">
                <h3 className="font-serif text-base md:text-2xl text-black leading-tight tracking-tight cursor-pointer">
                    {item.name}
                </h3>
            </Link>
            <div className="flex flex-col md:flex-row md:items-center md:gap-4">
                <div className="flex flex-col md:flex-row md:gap-4 text-[8px] md:text-[9px] font-bold tracking-[0.2em] md:tracking-[0.25em] uppercase text-stone-400 space-y-0.5 md:space-y-0">
                    <span className="flex items-center gap-1.5">
                        Size <span className="text-black font-black">{item.selectedSize}</span>
                    </span>
                    {item.selectedColor && (
                        <span className="flex items-center gap-1.5 md:pl-4 md:border-l md:border-stone-100">
                            Color <span className="text-black font-black">{item.selectedColor}</span>
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
