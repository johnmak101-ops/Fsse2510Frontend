/**
 * @file product attributes & variant selection
 * @module features/product/components/ProductVariantSelector
 * 
 * provides a dedicated interface for selecting product facets such as color and size.
 * features real-time inventory checks to reflect stock scarcity in the UI.
 */

"use client";

import { cn } from "@/lib/utils";
import { ProductInventory } from "@/types/product";
import { RiAddLine, RiSubtractLine } from "@remixicon/react";

/** properties for the ProductVariantSelector component. */
interface ProductVariantSelectorProps {
    /** list of all available inventory records for the product. */
    inventories: ProductInventory[];
    /** currently active color selection string. */
    selectedColor: string;
    /** currently active size selection string. */
    selectedSize: string;
    /** number of units currently queued for addition to cart. */
    quantity: number;
    /** units remaining in stock for the precisely matched variant. */
    remainingStock: number;
    /** color state mutation callback. */
    onColorChange: (color: string) => void;
    /** size state mutation callback. */
    onSizeChange: (size: string) => void;
    /** quantity state mutation callback. */
    onQuantityChange: (qty: number) => void;
    /** the unique SKU produced by the current attribute combination. */
    selectedVariantSku?: string;
}

/** dual-axis variant picker. */
export default function ProductVariantSelector({
    inventories,
    selectedColor,
    selectedSize,
    quantity,
    remainingStock,
    onColorChange,
    onSizeChange,
    onQuantityChange,
    selectedVariantSku,
}: ProductVariantSelectorProps) {
    const availableColors = Array.from(new Set(inventories.map((inv) => inv.color)));
    const filteredSizes = inventories.filter((inv) => inv.color === selectedColor);

    return (
        <>
            {/* ── SKU Display ── */}
            <span className="text-[10px] text-stone-400 font-mono mt-2">
                SKU: {selectedVariantSku ?? "N/A"}
            </span>

            {/* ── Colour Selector ── */}
            {availableColors.length > 0 && (
                <div className="mb-6">
                    <span className="text-[11px] font-bold uppercase tracking-widest block mb-4">
                        Select Color: {selectedColor}
                    </span>
                    <div className="flex flex-wrap gap-3">
                        {availableColors.map((color) => (
                            <button
                                key={color}
                                onClick={() => onColorChange(color)}
                                className={cn(
                                    "px-4 py-2 border text-[11px] font-bold uppercase transition-all",
                                    selectedColor === color
                                        ? "border-black bg-black text-white"
                                        : "border-stone-200 text-stone-600 hover:border-black"
                                )}
                            >
                                {color}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Size Selector ── */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-[11px] font-bold uppercase tracking-widest">
                        Select Size: {selectedSize}
                    </span>
                </div>
                <div className="flex flex-wrap gap-3">
                    {filteredSizes.map((inv) => (
                        <button
                            key={inv.size}
                            onClick={() => onSizeChange(inv.size)}
                            disabled={inv.stock <= 0}
                            className={cn(
                                "flex-1 min-w-[80px] py-3 border text-[11px] font-bold uppercase transition-all relative overflow-hidden",
                                selectedSize === inv.size
                                    ? "border-black bg-black text-white"
                                    : "border-stone-200 text-stone-600 hover:border-black",
                                inv.stock <= 0 && "opacity-40 cursor-not-allowed bg-stone-50 border-stone-100"
                            )}
                        >
                            {inv.size}
                            {inv.stock <= 0 && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-[120%] h-[1px] bg-stone-300 rotate-[-15deg]" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
                {selectedVariantSku && (
                    <p className="mt-2 text-[10px] text-stone-400">
                        {remainingStock > 0
                            ? `Stock: ${remainingStock} available`
                            : "Out of stock / Limit Reached"}
                    </p>
                )}
            </div>

            {/* ── Quantity Stepper ── */}
            <div className="flex items-center border border-stone-200 w-fit">
                <button
                    onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="px-4 py-3 hover:bg-stone-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <RiSubtractLine size={16} />
                </button>
                <span className="w-12 text-center text-sm font-bold">{quantity}</span>
                <button
                    onClick={() => onQuantityChange(Math.min(remainingStock, quantity + 1))}
                    disabled={quantity >= remainingStock}
                    className="px-4 py-3 hover:bg-stone-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <RiAddLine size={16} />
                </button>
            </div>
        </>
    );
}
