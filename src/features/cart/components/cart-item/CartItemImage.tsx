/**
 * @file cart Item thumbnail
 * @module features/cart/components/cart-item/CartItemImage
 * 
 * renders a high-quality product preview image for a cart item.
 * features responsive sizing and a hover-activated scale transition.
 */

"use client";

import React from "react";
import Image from "next/image";
import { CartItem } from "@/types/cart";

/** properties for the CartItemImage component. */
interface CartItemImageProps {
    /** The cart item containing the image metadata. */
    item: CartItem;
}

/** styled image wrapper for cart items. */
export default function CartItemImage({ item }: CartItemImageProps) {
    return (
        <div className="relative w-[100px] h-[130px] md:w-44 md:h-56 bg-stone-50 rounded-none overflow-hidden flex-shrink-0">
            <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                sizes="(max-width: 768px) 100px, 180px"
            />
        </div>
    );
}
