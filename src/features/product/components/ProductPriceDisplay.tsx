/**
 * @file adaptive product Price display
 * @module features/product/components/ProductPriceDisplay
 * 
 * renders a hierarchical pricing block suitable for product detail pages and quick views.
 * features conditional logic for member-exclusive pricing and automated MSRP comparisons.
 */

"use client";

import { cn } from "@/lib/utils";
import { Product } from "@/types/product";
import { getPromotionBadgeClass } from "@/lib/promotion-badge";
import { formatPrice } from "@/lib/format-price";

/** properties for the ProductPriceDisplay component. */
interface ProductPriceDisplayProps {
    /** The core product object containing pricing and promotion data. */
    product: Product;
    /** status flag indicating if price synchronization is active. */
    isSyncing: boolean;
}

/** styled price and promotion block. */
export default function ProductPriceDisplay({ product, isSyncing }: ProductPriceDisplayProps) {
    // While syncing, show a skeleton so the stale SSR price never flashes before
    // the real client-side price arrives.  This eliminates the "$162 → $182" flicker.
    if (isSyncing) {
        return (
            <div className="flex items-center gap-4 h-7">
                <div className="h-6 w-20 bg-stone-200 animate-pulse rounded" />
            </div>
        );
    }

    const hasDiscount = !!(product.discountAmount && product.discountAmount > 0);

    const isMemberExclusive = product.promotionBadgeTexts
        ?.some(b => b.toUpperCase().includes("EXCLUSIVE"));

    return (
        <div className="flex items-center gap-4">
            {/* ── Price ── */}
            {hasDiscount ? (
                <>
                    {isMemberExclusive && (
                        <span className="text-[11px] font-bold text-stone-900 uppercase tracking-widest">
                            Member Price
                        </span>
                    )}
                    <span className="text-xl font-bold text-sale-red">
                        {formatPrice(product.price)}
                    </span>
                    <span className="text-sm text-stone-300 line-through">
                        {product.originalPrice != null ? formatPrice(product.originalPrice) : ""}
                    </span>
                </>
            ) : product.isSale && product.discountPercentage ? (
                <>
                    {isMemberExclusive && (
                        <span className="text-[11px] font-bold text-stone-900 uppercase tracking-widest">
                            Member Price
                        </span>
                    )}
                    <span className="text-xl font-bold text-sale-red">
                        {formatPrice(product.price * (1 - product.discountPercentage))}
                    </span>
                    <span className="text-sm text-stone-300 line-through">
                        {formatPrice(product.price)}
                    </span>
                </>
            ) : (
                <span className="text-xl font-bold text-stone-900">
                    {formatPrice(product.price)}
                </span>
            )}

            {/* ── Promotion Badges ── */}
            {product.promotionBadgeTexts && product.promotionBadgeTexts.length > 0 ? (
                product.promotionBadgeTexts.map((badge, idx) => (
                    <span
                        key={idx}
                        className={cn(
                            "text-white text-[9px] font-sans font-bold px-2.5 py-1 rounded-full uppercase tracking-[0.15em]",
                            getPromotionBadgeClass(badge)
                        )}
                    >
                        {badge}
                    </span>
                ))
            ) : (
                /* ── Fallback % badge ── */
                hasDiscount &&
                product.discountPercentage != null &&
                product.discountPercentage > 0 && (
                    <span className="bg-sale-red text-white text-[9px] font-sans font-bold px-2.5 py-1 rounded-full uppercase tracking-[0.15em]">
                        {Math.abs(Math.round(product.discountPercentage * 100))}% OFF
                    </span>
                )
            )}
        </div>
    );
}
