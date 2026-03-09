/**
 * @file adaptive product Image gallery
 * @module features/product/components/ProductImageGallery
 * 
 * renders a responsive image showcase with integrated support for variant-specific image filtering.
 * automatically falls back to a global available-colors swatch if detailed gallery images are not provided.
 */

"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Product, ProductInventory } from "@/types/product";
import { getPromotionBadgeClass } from "@/lib/promotion-badge";

/** properties for the ProductImageGallery component. */
interface ProductImageGalleryProps {
    /** The product domain object containing the image metadata. */
    product: Product;
    /** The currently active color filter for variant-matched displays. */
    selectedColor: string;
    /** callback targeted at updating the global color state from a swatch interaction. */
    onColorChange: (color: string) => void;
    /** status flag indicating if the parent is performing data synchronization. */
    isSyncing: boolean;
}

/** dynamic image gallery with variant-aware filtering. */
export default function ProductImageGallery({
    product,
    selectedColor,
    onColorChange,
    isSyncing,
}: ProductImageGalleryProps) {
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    const inventories: ProductInventory[] = product.inventories ?? [];
    const availableColors = Array.from(new Set(inventories.map((inv) => inv.color)));

    const allImages = product.images ?? [];

    const displayImages =
        allImages.length > 0
            ? allImages.filter(
                (img) =>
                    img.tag?.toLowerCase() === selectedColor.toLowerCase() ||
                    img.tag?.toLowerCase() === "general" ||
                    img.tag?.toLowerCase() === "detail" ||
                    !img.tag
            )
            : [];

    const mainImage =
        displayImages[activeImageIndex]?.url ||
        product.imageUrl ||
        "/images/placeholder.jpg";

    const hasDiscount =
        !!(product.discountAmount && product.discountAmount > 0) && !isSyncing;

    return (
        <div className="lg:col-span-7 space-y-4">
            {/* ── Main Image ── */}
            <div className="relative aspect-[3/4] w-full bg-stone-50 overflow-hidden group">
                {/* Sale Badges */}
                {(product.isSale || hasDiscount) && (
                    <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-1.5">
                        {product.promotionBadgeTexts && product.promotionBadgeTexts.length > 0 ? (
                            product.promotionBadgeTexts.map((badge, idx) => (
                                <span
                                    key={idx}
                                    className={cn(
                                        "text-white text-[11px] font-sans font-bold px-3.5 py-1.5 rounded-full uppercase tracking-[0.15em] shadow-sm",
                                        getPromotionBadgeClass(badge)
                                    )}
                                >
                                    {badge}
                                </span>
                            ))
                        ) : (
                            <span className="bg-sale-red text-white text-[11px] font-sans font-bold px-3.5 py-1.5 rounded-full uppercase tracking-[0.15em] shadow-sm">
                                {product.discountPercentage
                                    ? `-${Math.round(product.discountPercentage * 100)}% OFF`
                                    : "SALE"}
                            </span>
                        )}
                    </div>
                )}

                <Image
                    src={mainImage}
                    alt={product.name}
                    fill
                    priority
                    className="object-cover transition-all duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 60vw"
                />
            </div>

            {/* ── Thumbnail Strip ── */}
            {displayImages.length > 1 && (
                <div className="grid grid-cols-6 gap-2">
                    {displayImages.map((img, index) => (
                        <div
                            key={`${img.url}-${index}`}
                            className={cn(
                                "relative aspect-[3/4] bg-stone-50 cursor-pointer overflow-hidden transition-all duration-300",
                                activeImageIndex === index
                                    ? "opacity-100 ring-1 ring-black ring-offset-1"
                                    : "opacity-40 hover:opacity-100"
                            )}
                            onClick={() => setActiveImageIndex(index)}
                        >
                            <Image
                                src={img.url}
                                alt={`${product.name} gallery ${index}`}
                                fill
                                className="object-cover"
                                sizes="10vw"
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* ── Colour Swatch Fallback (no gallery) ── */}
            {displayImages.length <= 1 && availableColors.length > 1 && (
                <div className="grid grid-cols-6 gap-2 border-t border-stone-100 pt-4">
                    <p className="col-span-full text-[10px] uppercase tracking-widest text-stone-400 mb-2">
                        Available Colors
                    </p>
                    {availableColors.map((color) => {
                        const variantWithImage = inventories.find(
                            (inv) => inv.color === color && inv.imageUrl
                        );
                        const thumbUrl =
                            variantWithImage?.imageUrl ||
                            product.imageUrl ||
                            "/images/placeholder.jpg";
                        return (
                            <div
                                key={color}
                                className={cn(
                                    "relative aspect-square bg-stone-50 cursor-pointer hover:opacity-80 transition-opacity",
                                    selectedColor === color && "ring-1 ring-black ring-offset-2"
                                )}
                                onClick={() => onColorChange(color)}
                            >
                                <Image
                                    src={thumbUrl}
                                    alt={color}
                                    fill
                                    className="object-cover"
                                    sizes="10vw"
                                />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
