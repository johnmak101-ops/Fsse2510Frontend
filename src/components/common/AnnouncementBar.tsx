/**
 * @file Dynamic promotional Announcement Bar
 * @module components/common/AnnouncementBar
 * 
 * displays rotating marketing banners at the top of every page.
 * features motion transitions and dynamic label formatting based on promotion type.
 */

"use client";

import { useEffect, useState } from "react";
import { Promotion, PromotionType, promotionService } from "@/services/promotion.service";
import { motion, AnimatePresence } from "framer-motion";

/**
 * formats promotion data into a high-visibility marketing string.
 * handles tiered discounts and storewide sale teasers.
 */
function formatSaleLabel(promo: Promotion): string {
    const isPercentage = promo.discountType === "PERCENTAGE";
    const valueStr = isPercentage ? `${promo.discountValue}%` : `$${promo.discountValue}`;

    if (promo.type === PromotionType.MIN_AMOUNT_DISCOUNT && promo.minAmount != null) {
        return `🔥  SPEND $${promo.minAmount} GET ${valueStr} OFF EVERYTHING  🔥`;
    }

    if (promo.type === PromotionType.MIN_QUANTITY_DISCOUNT && promo.minQuantity != null) {
        return `🔥  BUY ${promo.minQuantity}+ ITEMS GET ${valueStr} OFF  🔥`;
    }

    if (promo.type === PromotionType.STOREWIDE_SALE) {
        return `🔥  SALE ON NOW — ${valueStr} OFF SITEWIDE  🔥`;
    }

    return `🔥  ${promo.name.toUpperCase()}  🔥`;
}

/**
 * site-wide announcement component.
 * automatically cycles through active promotions using a 4-second interval.
 */
export default function AnnouncementBar() {
    const [sales, setSales] = useState<Promotion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Fetch active broad promotions on mount.
    useEffect(() => {
        promotionService
            .getActivePromotions([
                PromotionType.STOREWIDE_SALE,
                PromotionType.MIN_AMOUNT_DISCOUNT,
                PromotionType.MIN_QUANTITY_DISCOUNT
            ])
            .then(setSales)
            .catch(() => setSales([]));
    }, []);

    // Rotate through multiple active sales to ensure all campaigns get visibility.
    useEffect(() => {
        if (sales.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % sales.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [sales.length]);

    if (sales.length === 0) return null;

    const label = formatSaleLabel(sales[currentIndex]);

    return (
        <div
            id="announcement-bar"
            className="relative z-[60] w-full bg-[#1a1a1a] overflow-hidden"
            style={{ height: "40px" }}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <p className="text-white text-[13px] font-bold tracking-[0.3em] uppercase select-none whitespace-nowrap">
                        {label}
                    </p>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
