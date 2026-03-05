/**
 * @file Inventory Alert Dialog
 * @module components/checkout/OutOfStockModal
 * 
 * specialized modal displayed during checkout when cart items are no longer available in stock.
 * guides the user back to the cart for re-validation.
 */

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import Button from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

/** properties for the OutOfStockModal component. */
interface OutOfStockModalProps {
    /** controls the visibility of the modal. */
    isOpen: boolean;
    /** callback triggered when the user attempts to close the modal. */
    onClose: () => void;
    /** The specific stock status message provided by the server. */
    message: string;
    /** callback to redirect the user back to the cart page. */
    onReturnToCart: () => void;
}

/**
 * stock status enforcement modal.
 * features a clean serif design and high-contrast call to action.
 */
export default function OutOfStockModal({
    isOpen,
    onClose,
    message,
    onReturnToCart,
}: OutOfStockModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white border-none shadow-2xl rounded-none p-8">
                <DialogHeader className="flex flex-col items-center text-center space-y-4">
                    <div className="p-3 bg-stone-50 rounded-full">
                        <AlertCircle className="w-8 h-8 text-stone-400" />
                    </div>
                    <DialogTitle className="font-serif text-2xl text-[#5C534E]">
                        Item Out of Stock
                    </DialogTitle>
                    <div className="w-12 h-px bg-stone-200" />
                </DialogHeader>

                <div className="py-2 text-center">
                    <DialogDescription className="text-sm text-stone-500 font-medium leading-relaxed">
                        {message ||
                            "Some items in your cart are no longer available. Please return to your shopping bag to update your order."}
                    </DialogDescription>
                </div>

                <DialogFooter className="sm:justify-center mt-4">
                    <Button
                        type="button"
                        onClick={onReturnToCart}
                        className="w-full sm:w-auto px-8 py-6 bg-black text-white hover:bg-stone-800 rounded-none uppercase tracking-[0.2em] text-[10px] font-bold shadow-lg shadow-black/5"
                    >
                        Back to Shopping Bag
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
