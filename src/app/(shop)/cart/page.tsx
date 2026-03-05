"use client";

import React, { Suspense } from "react";
import { useCartStore } from "@/features/cart/store/useCartStore";
import { useWishlistStore } from "@/features/wishlist/store/useWishlistStore";
import { useRouter } from "next/navigation";
import { useCartSync } from "@/hooks/useCartSync";

import ProductRecommendationsSection from "@/features/product/components/ProductRecommendationsSection";
import CartLoadingState from "@/features/cart/components/cart/CartLoadingState";
import CartEmptyState from "@/features/cart/components/cart/CartEmptyState";
import CartItemsList from "@/features/cart/components/cart/CartItemsList";
import CartOrderSummary from "@/features/cart/components/cart/CartOrderSummary";
import CartUpsellBanner from "@/features/cart/components/CartUpsellBanner";
import MembershipUpgradeBanner from "@/features/cart/components/MembershipUpgradeBanner";

export default function CartPage() {
    const { mounted, isInitialSyncing, authLoading, user } = useCartSync();

    const {
        items,
        totalPrice,
        totalOriginalPrice,
        totalQuantity,
        updateQuantity,
        removeItem,
        updatingSkus,
        _updateDebounceTimer
    } = useCartStore();

    // Global Sync State for Checkout Guard
    const isCartSyncing = updatingSkus.size > 0 || !!_updateDebounceTimer;
    const { addItem: addToWishlist } = useWishlistStore();
    const router = useRouter();


    // Hydration & Auth Guard: Show Cinematic Loading Sequence
    if (!mounted || authLoading || isInitialSyncing) {
        return <CartLoadingState />;
    }

    if (!user) {
        return <CartLoadingState />;
    }

    if (items.length === 0) {
        return <CartEmptyState />;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 pt-16 xl:pt-64 pb-20 lg:px-8">
            {/* Membership Upgrade Banner */}
            <MembershipUpgradeBanner />

            {/* Upsell Banner — shows when MIN_QUANTITY threshold is not yet met */}
            <CartUpsellBanner cartItems={items} />

            <div className="flex flex-col lg:flex-row gap-12">
                <CartItemsList
                    items={items}
                    totalQuantity={totalQuantity}
                    updatingSkus={updatingSkus}
                    onUpdateQty={(sku, qty) => updateQuantity(sku, qty)}
                    onRemove={removeItem}

                    onSaveForLater={async (item) => {
                        if (!user) {
                            router.push(`/login?redirect=/cart`);
                            return;
                        }
                        await addToWishlist(item.pid);
                        await removeItem(item.sku);
                    }}
                />

                {/* Right: Summary */}
                <CartOrderSummary
                    totalPrice={totalPrice}
                    totalOriginalPrice={totalOriginalPrice}
                    isCartSyncing={isCartSyncing}

                    onCheckout={() => router.push("/checkout")}
                />
            </div>

            {/* Recommendations */}
            <div className="mt-32">
                <h3 className="font-serif text-3xl text-[#5C534E] text-center mb-12">You May Also Like</h3>
                <Suspense fallback={<div className="h-96 flex items-center justify-center text-[#D1C7C1]">Loading recommendations...</div>}>
                    <ProductRecommendationsSection />
                </Suspense>
            </div>
        </div>
    );
}
