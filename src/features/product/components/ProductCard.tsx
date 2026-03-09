/**
 * @file visual Product representation
 * @module features/product/components/ProductCard
 * 
 * renders a premium product preview with integrated badges for sale status, new arrivals, and inventory alerts.
 * implements a deterministic stagger animation using GSAP to ensure smooth page entrances without hydration mismatches.
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Product } from "@/types/product";
import { getPromotionBadgeClass } from "@/lib/promotion-badge";
import { formatPrice } from "@/lib/format-price";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

/** properties for the ProductCard component. */
interface ProductCardProps {
  /** The product domain object to display. */
  product: Product;
  /** flag to prioritize image loading (LCP optimization). */
  priority?: boolean;
}

/**
 * atomic product card.
 * features lazy-loading blurs and high-depth hover transitions.
 */
export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Deterministic stagger based on pid — avoids hydration mismatch from Math.random()
  const staggerDelay = ((product.pid % 5) / 5) * 0.2;

  useGSAP(() => {
    gsap.from(cardRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.8,
      ease: "power3.out",
      delay: staggerDelay
    });
  }, { scope: cardRef });

  // Runtime Check: Ensure product exists
  if (!product) return null;

  const hasDiscount = product.discountAmount && product.discountAmount > 0;
  const isSoldOut = product.stock <= 0;
  const productHref = `/product/${product.slug || product.pid}`;

  const displayImage = product.imageUrl || "/images/placeholder.jpg";

  return (
    <div
      ref={cardRef}
      className="product-card group relative flex flex-col gap-4 text-center"
    >
      {/* 1. Image Container */}
      <div className="aspect-[3/4] w-full overflow-hidden rounded-xl bg-stone-100/40 relative shadow-sm transition-shadow duration-500 group-hover:shadow-md">

        {/* --- BADGES --- */}
        <div className="absolute top-3 left-3 right-0 flex flex-col items-start gap-1.5 z-20">
          {isSoldOut ? (
            <span className="bg-stone-800/90 backdrop-blur-sm text-white text-[9px] font-sans font-bold px-2.5 py-1 rounded-full uppercase tracking-[0.15em]">
              Sold Out
            </span>
          ) : (
            <div className="flex gap-1.5">
              {product.isNew && (
                <span className="bg-brand-primary text-brand-text text-[9px] font-sans font-bold px-2.5 py-1 rounded-full uppercase tracking-[0.15em]">
                  New
                </span>
              )}
              {product.isSale && (
                product.promotionBadgeTexts && product.promotionBadgeTexts.length > 0 ? (
                  product.promotionBadgeTexts.map((badge, idx) => (
                    <span key={idx} className={cn(
                      "text-white text-[9px] font-sans font-bold px-2.5 py-1 rounded-full uppercase tracking-[0.15em]",
                      getPromotionBadgeClass(badge)
                    )}>
                      {badge}
                    </span>
                  ))
                ) : (
                  <span className="bg-sale-red text-white text-[9px] font-sans font-bold px-2.5 py-1 rounded-full uppercase tracking-[0.15em]">
                    {product.discountPercentage && Math.abs(product.discountPercentage) > 0
                      ? `-${Math.abs(Math.round(product.discountPercentage * 100))}% OFF`
                      : "SALE"}
                  </span>
                )
              )}
            </div>
          )}
        </div>

        {/* --- PRODUCT IMAGE --- */}
        <Link
          href={productHref}
          className={cn("block h-full w-full relative", isSoldOut && "opacity-60 grayscale-[0.3]")}
        >
          <Image
            src={displayImage}
            alt={product.name}
            fill
            priority={priority}
            onLoad={() => setIsLoaded(true)}
            className={cn(
              "h-full w-full object-cover object-center transition-all duration-1000 ease-out group-hover:scale-105",
              isLoaded ? "opacity-100 blur-0" : "opacity-0 blur-sm"
            )}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        </Link>


      </div>

      {/* 2. Product Info (Center Aligned) */}
      <div className="flex flex-col items-center space-y-1.5 px-2">
        <p className="font-sans text-[9px] md:text-[10px] uppercase tracking-[0.25em] text-brand-text/40 font-bold">
          {product.category}
        </p>

        <h3 className="font-sans text-sm font-medium text-brand-text leading-tight line-clamp-3 min-h-[4.2em] w-full px-1">
          <Link href={productHref}>
            {product.name}
          </Link>
        </h3>

        <div className="font-sans flex items-center justify-center gap-2.5 pt-1">
          {hasDiscount ? (
            <>
              {product.promotionBadgeTexts?.some(b => b.toUpperCase().includes("EXCLUSIVE")) && (
                <span className="text-[10px] font-bold text-stone-900 uppercase tracking-wider block">
                  Member Price
                </span>
              )}
              <span className="font-bold text-sale-red text-sm">
                {formatPrice(product.price)}
              </span>
              <span className="text-brand-text/30 line-through text-[11px] font-medium">
                {product.originalPrice != null ? formatPrice(product.originalPrice) : ""}
              </span>
            </>
          ) : (
            <span className="font-semibold text-brand-text/80 text-sm">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}