"use client";

import React, { useEffect, useState } from "react";
import { useCartStore } from "@/features/cart/store/useCartStore";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button";
import { Loader2, Lock } from "lucide-react";
import apiClient from "@/services/api-client";
import PaymentWrapper from "@/components/checkout/PaymentWrapper";
import { formatCurrency } from "@/lib/utils";
import { getFriendlyErrorMessage } from "@/lib/error-utils";
import CheckoutOrderSummary from "@/components/checkout/CheckoutOrderSummary";
import AddressSelector from "@/components/checkout/AddressSelector";

import OutOfStockModal from "../../../components/checkout/OutOfStockModal";


interface TransactionResponse {
    tid: number;
    status: string;
    total: number;
    // ... potentially other fields
}

export default function CheckoutPage() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuthStore();
    const { items, totalPrice, syncWithServer, isSyncing } = useCartStore();

    const [tid, setTid] = useState<number | null>(null);
    const [isCreatingTransaction, setIsCreatingTransaction] = useState(false);
    const [creationError, setCreationError] = useState<string | null>(null);
    const [isOutOfStockOpen, setIsOutOfStockOpen] = useState(false);

    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountValue: number; discountType: string } | null>(null);
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
    const [couponError, setCouponError] = useState<string | null>(null);

    const [usePoints, setUsePoints] = useState(0);

    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);


    const pointsDiscount = Math.round(((usePoints * 1) / 10) * 100) / 100;
    const finalTotal = Math.max(0, Math.round((totalPrice - couponDiscount - pointsDiscount) * 100) / 100);
    const isLowAmount = finalTotal > 0 && finalTotal < 4;


    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login?redirect=/checkout");
        }
    }, [authLoading, user, router]);


    useEffect(() => {
        if (user) {
            void syncWithServer();
        }
    }, [user, syncWithServer]);


    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        setIsValidatingCoupon(true);
        setCouponError(null);
        try {

            interface CouponValidationResponse {
                code: string;
                discountValue: number;
                discountType: string;
            }
            const res = await apiClient.get<CouponValidationResponse>(`/public/coupon/validate`, {
                searchParams: {
                    code: couponCode,
                    total: totalPrice.toString()
                }
            });


            let discount = 0;
            if (res.discountType === "PERCENTAGE") {
                discount = Math.round((totalPrice * res.discountValue) * 100) / 100;
            } else if (res.discountType === "FIXED") {
                discount = res.discountValue;
            }

            setAppliedCoupon(res);
            setCouponDiscount(discount);
        } catch (err: unknown) {
            const errorMessage = getFriendlyErrorMessage(err);
            // If the backend didn't provide a specific message, it might default to "An unexpected error occurred."
            // We want to be more specific or use the actual backend message.
            setCouponError(errorMessage || "Invalid coupon code");
            setAppliedCoupon(null);
            setCouponDiscount(0);
        } finally {
            setIsValidatingCoupon(false);
        }
    };

    const handleCreateTransaction = async () => {
        setIsCreatingTransaction(true);
        setCreationError(null);
        try {

            const payload = {
                couponCode: appliedCoupon ? appliedCoupon.code : undefined,
                usePoints: usePoints > 0 ? usePoints : undefined,
                addressId: selectedAddressId ? selectedAddressId : undefined
            };

            const response = await apiClient.post<TransactionResponse>("/transactions", payload);
            setTid(response.tid);
            // We NO LONGER clear cart here.
            // If we clear here, the UI instantly re-renders as $0.00 while waiting for Stripe redirect.
            // We already clear the cart on the Success & Cancel pages anyway.
        } catch (err) {
            const errorMessage = getFriendlyErrorMessage(err);

            // Check for Insufficient stock error
            if (errorMessage.toLowerCase().includes("insufficient stock")) {
                // Don't show the red box, just show the modal
                setCreationError(null);
                setIsOutOfStockOpen(true);
            } else {
                setCreationError(errorMessage);
            }
        } finally {
            setIsCreatingTransaction(false);
        }
    };

    if (authLoading || !user || isSyncing) {
        return (
            <div className="flex h-screen items-center justify-center bg-white">
                <Loader2 className="h-8 w-8 animate-spin text-stone-300" />
            </div>
        );
    }

    if (items.length === 0 && !tid) {
        return (
            <div className="container py-32 text-center bg-white min-h-screen">
                <h1 className="text-3xl font-serif text-[#5C534E] mb-6">Your bag is empty</h1>
                <Button className="rounded-none bg-[#5C534E] px-8 py-6 uppercase tracking-widest text-xs font-bold" onClick={() => router.push("/")}>
                    Return to Shop
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-24 md:py-32">
            <h1 className="mb-12 text-3xl md:text-4xl font-serif text-[#5C534E] text-center tracking-tight">Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">

                <div className="space-y-16">
                    <AddressSelector
                        selectedId={selectedAddressId}
                        onSelect={setSelectedAddressId}
                    />

                    <CheckoutOrderSummary items={items} />
                </div>


                <div className="lg:sticky lg:top-32 h-fit">
                    <div className="bg-white border border-stone-200 rounded-none p-8 md:p-10 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="font-serif text-3xl text-black uppercase tracking-tight">
                                Payment
                            </h2>
                            <Lock className="w-4 h-4 text-stone-300" />
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between text-stone-400 text-[11px] font-bold tracking-widest uppercase">
                                <span>Subtotal</span>
                                <span className="text-black">{formatCurrency(totalPrice)}</span>
                            </div>

                            {/* Discounts */}
                            {couponDiscount > 0 && (
                                <div className="flex justify-between text-green-600 text-[11px] font-bold tracking-widest uppercase">
                                    <span>Coupon ({appliedCoupon?.code})</span>
                                    <span>- {formatCurrency(couponDiscount)}</span>
                                </div>
                            )}
                            {pointsDiscount > 0 && (
                                <div className="flex justify-between text-green-600 text-[11px] font-bold tracking-widest uppercase">
                                    <span>Points ({usePoints})</span>
                                    <span>- {formatCurrency(pointsDiscount)}</span>
                                </div>
                            )}

                            <div className="flex justify-between text-stone-400 text-[11px] font-bold tracking-widest uppercase">
                                <span>Shipping</span>
                                <span className="text-black">FREE</span>
                            </div>

                            <div className="border-t border-stone-100 pt-6 mt-6">
                                <div className="flex justify-between items-baseline mb-3">
                                    <span className="text-stone-300 font-bold text-[11px] tracking-widest uppercase">
                                        Total
                                    </span>
                                    <span className="text-black font-serif text-4xl">
                                        {formatCurrency(finalTotal)}
                                    </span>
                                </div>
                                <p className="text-[9px] text-stone-300 font-bold tracking-[0.2em] uppercase leading-relaxed">
                                    Taxes included.
                                </p>
                            </div>
                        </div>

                        {creationError && (
                            <div className="mb-6 p-4 text-[10px] font-bold tracking-wide text-red-500 bg-red-50 border border-red-100 uppercase text-center">
                                {creationError}
                            </div>
                        )}

                        {!tid ? (
                            <div className="text-center pt-2">

                                <div className="mb-6">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Coupon Code"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value)}
                                            className="flex-1 px-4 py-3 bg-white border border-stone-200 text-[11px] placeholder:text-stone-400 focus:outline-none focus:border-black uppercase tracking-widest"
                                        />
                                        <Button
                                            onClick={handleApplyCoupon}
                                            disabled={isValidatingCoupon || !couponCode}
                                            className="px-6 bg-stone-800 text-white rounded-none uppercase text-[10px] tracking-widest hover:bg-black"
                                        >
                                            {isValidatingCoupon ? <Loader2 className="w-3 h-3 animate-spin" /> : "Apply"}
                                        </Button>
                                    </div>
                                    {couponError && <p className="mt-2 text-[10px] text-red-500 text-left">{couponError}</p>}
                                    {appliedCoupon && (
                                        <p className="mt-2 text-[10px] text-green-600 text-left flex justify-between">
                                            <span>Applied: {appliedCoupon.code}</span>
                                            <button onClick={() => { setAppliedCoupon(null); setCouponDiscount(0); setCouponCode(""); }} className="underline">Remove</button>
                                        </p>
                                    )}
                                </div>


                                {user && user.points > 0 && (
                                    <div className="mb-8 p-4 bg-stone-50 border border-stone-100">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Use Points</span>
                                            <span className="text-[10px] text-stone-400">Balance: {user.points}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="number"
                                                min="0"
                                                step="10"
                                                max={user.points}
                                                value={usePoints}
                                                onChange={(e) => {
                                                    let val = parseInt(e.target.value) || 0;

                                                    // Calculate max points needed for the remaining balance
                                                    const remainingBalance = totalPrice - couponDiscount;
                                                    const pointsNeeded = Math.max(0, Math.ceil(remainingBalance * 10));

                                                    // Cap at either points balance or points needed
                                                    const cap = Math.min(user.points, pointsNeeded);

                                                    if (val > cap) {
                                                        val = cap;
                                                    }
                                                    setUsePoints(val);
                                                }}
                                                className="w-20 px-2 py-2 bg-white border border-stone-200 text-center text-[11px] focus:outline-none"
                                            />
                                            <div className="flex-1 text-right text-[10px] text-stone-400">
                                                - {formatCurrency(usePoints / 10)} ({usePoints} pts)
                                            </div>
                                        </div>
                                        <p className="mt-2 text-[9px] text-stone-400 text-left">
                                            10 Points = $1.00 Discount
                                        </p>
                                    </div>
                                )}

                                {isLowAmount && (
                                    <div className="mb-6 p-4 bg-amber-50 border border-amber-100 text-left">
                                        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">Minimum Payment Required</p>
                                        <p className="text-[10px] text-amber-700 leading-relaxed font-medium">
                                            The minimum amount for online payment is HKD 4.00. Please use more points to reach HKD 0.00 or add more items to your bag.
                                        </p>
                                    </div>
                                )}

                                <Button
                                    className="w-full py-6 bg-black text-white hover:bg-stone-800 rounded-none uppercase tracking-[0.4em] text-[10px] font-bold transition-all shadow-lg shadow-black/10 disabled:bg-stone-200 disabled:text-stone-400 disabled:shadow-none"
                                    onClick={handleCreateTransaction}
                                    disabled={isCreatingTransaction || isLowAmount || !selectedAddressId}
                                >
                                    {isCreatingTransaction ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        "Confirm & Pay"
                                    )}
                                </Button>
                                <p className="mt-4 text-[9px] text-stone-400 font-bold tracking-widest uppercase text-center">
                                    Secure SSL Encryption
                                </p>
                            </div>
                        ) : (
                            <div className="pt-4 border-t border-stone-100">
                                <div className="mb-6 text-center">
                                    <p className="text-[10px] font-bold tracking-widest text-[#5C534E] uppercase mb-2">Secure Connection Established</p>
                                    <div className="h-px w-12 bg-[#5C534E] mx-auto opacity-20"></div>
                                </div>
                                <PaymentWrapper tid={tid} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <OutOfStockModal
                isOpen={isOutOfStockOpen}
                onClose={() => setIsOutOfStockOpen(false)}
                message={creationError || ""}
                onReturnToCart={() => router.push("/cart")}
            />
        </div>
    );
}
