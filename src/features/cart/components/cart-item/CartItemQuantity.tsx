/**
 * @file cart Item quantity Controller
 * @module features/cart/components/cart-item/CartItemQuantity
 * 
 * provides a premium numeric input and adjustment interface for managing item quantities.
 * features local state caching for fluid user input and automated synchronization with the global store.
 */

"use client";

import React from "react";

/** properties for the CartItemQuantity component. */
interface CartItemQuantityProps {
    /** current quantity set in the store. */
    quantity: number;
    /** maximum available units in inventory. */
    stock: number;
    /** primary unit identifier for the item. */
    sku: string;
    /** status flag indicating if a stock check or sync is active. */
    isCheckingStock: boolean;
    /** callback for persisting quantity changes. */
    onUpdateQty: (sku: string, qty: number) => void;
}

/**
 * dual-control quantity input component.
 * supports both direct numeric entry and tactile incremental buttons.
 */
export default function CartItemQuantity({
    quantity,
    stock,
    sku,
    isCheckingStock,
    onUpdateQty,
}: CartItemQuantityProps) {
    // Use local state for input to allow fluid typing without instant store updates
    const [localQty, setLocalQty] = React.useState(quantity);

    // Keep local qty in sync with store
    React.useEffect(() => {
        setLocalQty(quantity);
    }, [quantity]);

    const handleInputFinish = () => {
        let val = localQty;
        if (isNaN(val) || val < 1) val = 1;
        if (val > stock) val = stock;
        setLocalQty(val);
        if (val !== quantity) {
            onUpdateQty(sku, val);
        }
    };

    const handleButtonUpdate = (delta: number) => {
        const nextVal = localQty + delta;
        if (nextVal < 1 || nextVal > stock) return;
        onUpdateQty(sku, nextVal);
        setLocalQty(nextVal);
    };

    return (
        <div className="flex items-center gap-0 bg-white border border-stone-200 px-1 py-1 rounded-none">
            <button
                onClick={() => handleButtonUpdate(-1)}
                className="w-10 h-10 flex items-center justify-center text-black hover:bg-stone-50 transition-all disabled:opacity-20"
                disabled={quantity <= 1 || isCheckingStock}
            >
                -
            </button>

            <div className="w-12 h-10 flex items-center justify-center border-x border-stone-100">
                {isCheckingStock ? (
                    <span className="w-3 h-3 border border-stone-200 border-t-black rounded-full animate-spin" />
                ) : (
                    <input
                        type="number"
                        min={1}
                        max={stock}
                        value={localQty}
                        onChange={(e) => {
                            const rawValue = e.target.value;
                            if (rawValue === "") {
                                setLocalQty(0);
                                return;
                            }
                            const val = parseInt(rawValue);
                            if (val < 0) {
                                setLocalQty(Math.abs(val) || 1);
                            } else {
                                setLocalQty(isNaN(val) ? 0 : val);
                            }
                        }}
                        onBlur={handleInputFinish}
                        onKeyDown={(e) => {
                            if (["-", "+", "e", "E", "."].includes(e.key)) {
                                e.preventDefault();
                            }
                            if (e.key === "Enter") handleInputFinish();
                        }}
                        onPaste={(e) => {
                            const pasteData = e.clipboardData.getData("text");
                            if (!/^\d+$/.test(pasteData)) {
                                e.preventDefault();
                            }
                        }}
                        className="w-full h-full bg-transparent text-center font-bold text-xs text-black outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                )}
            </div>

            <button
                onClick={() => handleButtonUpdate(1)}
                className="w-10 h-10 flex items-center justify-center text-black hover:bg-stone-50 transition-all disabled:opacity-20"
                disabled={isCheckingStock || quantity >= stock}
            >
                +
            </button>
        </div>
    );
}
