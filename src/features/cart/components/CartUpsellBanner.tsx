/**
 * @file interactive Cart Upsell display
 * @module features/cart/components/CartUpsellBanner
 * 
 * calculates and displays available promotion opportunities based on current cart state.
 * implements 'Superiority Filtering' to prevent weaker prompts from confusing users who already have better deals.
 */

"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CartItem } from "@/types/cart";
import { Promotion, PromotionType, promotionService } from "@/services/promotion.service";
import { MembershipLevel } from "@/types/membership";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

/** properties for the CartUpsellBanner component. */
interface CartUpsellBannerProps {
    /** The active list of items to calculate upsell eligibility against. */
    cartItems: CartItem[];
}

/** internal representation of a calculated upsell prompt. */
type UpsellKind =
    | { kind: "quantity"; needed: number; status: "incomplete" | "ready" | "applied" | "locked"; promoId: number; promoName: string; discountLabel: string; targetLevel?: MembershipLevel }
    | { kind: "amount"; needed: number; status: "incomplete" | "applied" | "locked"; promoId: number; promoName: string; discountLabel: string; targetLevel?: MembershipLevel };

/** defines the prioritized progression of membership levels. */
const LEVEL_ORDER: Record<MembershipLevel, number> = {
    [MembershipLevel.NO_MEMBERSHIP]: 0,
    [MembershipLevel.BRONZE]: 1,
    [MembershipLevel.SILVER]: 2,
    [MembershipLevel.GOLD]: 3,
    [MembershipLevel.DIAMOND]: 4,
};

/**
 * validates item eligibility for a specific promotion.
 * mirrors the backend logic for consistency between storefront prompts and checkout pricing.
 * treats promotions without targets as storewide.
 * 
 * @param item - The cart item to evaluate.
 * @param promo - The promotion definition to check against.
 * @returns {boolean} compatibility status.
 */
function isItemEligible(item: CartItem, promo: Promotion): boolean {
    const hasTargetPids = (promo.targetPids?.length ?? 0) > 0;
    const hasTargetCategories = (promo.targetCategories?.length ?? 0) > 0;
    const hasTargetCollections = (promo.targetCollections?.length ?? 0) > 0;
    const hasTargetTags = (promo.targetTags?.length ?? 0) > 0;

    // WHY: trust the backend's pre-calculated match if it has already been applied.
    if (item.appliedPromotionIds?.includes(promo.id)) return true;

    const hasAnyTarget = hasTargetPids || hasTargetCategories || hasTargetCollections || hasTargetTags;

    if (!hasAnyTarget) return true;

    if (hasTargetPids && promo.targetPids?.includes(item.pid)) return true;

    if (hasTargetCategories && item.category) {
        const itemCat = item.category.trim().toLowerCase();
        if (promo.targetCategories?.some(c => c.trim().toLowerCase() === itemCat)) return true;
    }

    if (hasTargetCollections && item.collection) {
        const itemCol = item.collection.trim().toLowerCase();
        if (promo.targetCollections?.some(c => c.trim().toLowerCase() === itemCol)) return true;
    }

    if (hasTargetTags && item.tags?.length) {
        const itemTagsLower = item.tags.map(t => t.trim().toLowerCase());
        if (promo.targetTags?.some(pt => itemTagsLower.includes(pt.trim().toLowerCase()))) return true;
    }

    return false;
}

/** transforms promotion discount definitions into human-readable strings. */
function formatDiscountLabel(promo: Promotion): string {
    if (promo.type === PromotionType.BUY_X_GET_Y_FREE) {
        return `${promo.getY || 1} FREE`;
    }
    if (!promo.discountType || promo.discountValue == null) return "a discount";
    if (promo.discountType === "PERCENTAGE") {
        return `${promo.discountValue}% OFF`;
    }
    return `$${promo.discountValue} OFF`;
}

export default function CartUpsellBanner({ cartItems }: CartUpsellBannerProps) {
    const [messages, setMessages] = useState<UpsellKind[]>([]);
    const { user } = useAuthStore();
    const userLevel = user?.membership?.level || MembershipLevel.NO_MEMBERSHIP;

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const promos = await promotionService.getActivePromotions([
                    PromotionType.MIN_QUANTITY_DISCOUNT,
                    PromotionType.MIN_AMOUNT_DISCOUNT,
                    PromotionType.BUY_X_GET_Y_FREE,
                    PromotionType.BUNDLE_DISCOUNT,
                ]);

                if (cancelled) return;

                const result: UpsellKind[] = [];

                for (const promo of promos) {
                    const eligibleItems = cartItems.filter(item => isItemEligible(item, promo));
                    const totalQty = eligibleItems.reduce((sum, item) => sum + item.cartQuantity, 0);
                    const totalAmt = eligibleItems.reduce((sum, item) => sum + item.price * item.cartQuantity, 0);

                    if (eligibleItems.length === 0) continue;

                    // --- SUPERIORITY FILTERING (Solve 50% vs 10% confusion) ---

                    // Define which promotions always stack and should never be hidden (Order-level)
                    const STACKABLE_TYPES = [
                        PromotionType.MIN_QUANTITY_DISCOUNT,
                        PromotionType.MIN_AMOUNT_DISCOUNT
                    ];

                    // Calculate potential discount percentage of this promo
                    let potentialPct = 0;
                    if (promo.type === PromotionType.BUY_X_GET_Y_FREE) {
                        const buyX = promo.buyX || 1;
                        const getY = promo.getY || 1;
                        potentialPct = (getY / (buyX + getY)) * 100;
                    } else if (promo.discountType === "PERCENTAGE") {
                        potentialPct = promo.discountValue || 0;
                    } else if (promo.discountType === "FIXED" && promo.discountValue) {
                        // Estimate based on minAmount or current totalAmt
                        const basis = promo.minAmount || totalAmt;
                        potentialPct = basis > 0 ? (promo.discountValue / basis) * 100 : 0;
                    }

                    // Calculate current average discount percentage of eligible items
                    const currentPct = (eligibleItems.reduce((sum, item) => sum + (item.discountPercentage || 0) * item.cartQuantity, 0) / totalQty) * 100;

                    // If user already has a better deal on these items, don't confuse them with a weaker prompt
                    // UNLESS it's an order-level discount that stacks anyway!
                    if (!STACKABLE_TYPES.includes(promo.type) && potentialPct <= currentPct + 0.1) {
                        continue;
                    }

                    // --- MIN_QUANTITY_DISCOUNT / BUNDLE / B2GY ---
                    const minQty = promo.minQuantity || (promo.type === PromotionType.BUY_X_GET_Y_FREE ? (promo.buyX || 0) + (promo.getY || 1) : 0);

                    if (promo.type === PromotionType.MIN_QUANTITY_DISCOUNT ||
                        promo.type === PromotionType.BUNDLE_DISCOUNT ||
                        promo.type === PromotionType.BUY_X_GET_Y_FREE) {

                        const threshold = promo.type === PromotionType.BUY_X_GET_Y_FREE ? (promo.buyX || 0) : minQty;
                        const fullCycle = promo.type === PromotionType.BUY_X_GET_Y_FREE ? threshold + (promo.getY || 1) : threshold;

                        const isLocked = promo.targetMemberLevel && LEVEL_ORDER[userLevel] < LEVEL_ORDER[promo.targetMemberLevel as MembershipLevel];

                        let needed = 0;
                        let status: "incomplete" | "ready" | "applied" | "locked" = "incomplete";

                        if (isLocked) {
                            status = "locked";
                            needed = 0;
                        } else if (totalQty < threshold) {
                            needed = threshold - totalQty;
                            status = "incomplete";
                        } else if (totalQty < fullCycle) {
                            needed = fullCycle - totalQty;
                            status = "ready";
                        } else {
                            needed = 0;
                            status = "applied";
                        }

                        result.push({
                            kind: "quantity",
                            status,
                            promoId: promo.id,
                            promoName: promo.name,
                            needed,
                            discountLabel: formatDiscountLabel(promo),
                            targetLevel: promo.targetMemberLevel as MembershipLevel,
                        });
                    }

                    // --- MIN_AMOUNT_DISCOUNT ---
                    if (promo.type === PromotionType.MIN_AMOUNT_DISCOUNT) {
                        const isLocked = promo.targetMemberLevel && LEVEL_ORDER[userLevel] < LEVEL_ORDER[promo.targetMemberLevel as MembershipLevel];
                        const minAmt = promo.minAmount ?? 0;
                        const isMet = totalAmt >= minAmt;
                        const needed = minAmt - totalAmt;

                        result.push({
                            kind: "amount",
                            status: isLocked ? "locked" : (isMet ? "applied" : "incomplete"),
                            promoId: promo.id,
                            promoName: promo.name,
                            needed: (isLocked || isMet) ? 0 : Math.ceil(needed * 100) / 100,
                            discountLabel: formatDiscountLabel(promo),
                            targetLevel: promo.targetMemberLevel as MembershipLevel,
                        });
                    }
                }

                setMessages(result);
            } catch {
                // Silently fail — upsell banner is non-critical
                setMessages([]);
            }
        })();

        return () => { cancelled = true; };
    }, [cartItems, userLevel]);

    if (messages.length === 0) return null;

    return (
        <AnimatePresence mode="popLayout">
            {messages.map((msg) => (
                <motion.div
                    key={msg.promoId}
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="overflow-hidden"
                >
                    <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-none px-5 py-4 mb-4">
                        <p className="text-[12px] font-semibold tracking-wide text-amber-800">
                            {msg.status === "incomplete" ? (
                                <>
                                    Offer Available: <span className="font-bold">{msg.promoName}</span>
                                    <br />
                                    {msg.kind === "quantity" ? (
                                        <>
                                            Add <span className="text-amber-600 font-bold">{msg.needed} more</span> to qualify!
                                        </>
                                    ) : (
                                        <>
                                            Spend <span className="text-amber-600 font-bold">${msg.needed.toFixed(2)} more</span> to qualify!
                                        </>
                                    )}
                                </>
                            ) : msg.status === "ready" ? (
                                <>
                                    Qualified! <span className="font-bold">{msg.promoName}</span>
                                    <br />
                                    Add <span className="text-amber-600 font-bold">{msg.needed} more</span> item for FREE!
                                </>
                            ) : msg.status === "locked" ? (
                                <>
                                    Unlock Bonus: <span className="font-bold">{msg.promoName}</span>
                                    <br />
                                    Requires <span className="text-amber-600 font-bold">{msg.targetLevel?.replace('_', ' ')}</span> membership level or higher.
                                </>
                            ) : (
                                <>
                                    <span className="font-bold">{msg.promoName}</span> — Applied!
                                </>
                            )}
                        </p>
                    </div>
                </motion.div>
            ))}
        </AnimatePresence>
    );
}
