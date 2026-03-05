/**
 * @file Promotion Badge Styling Utility
 * @module lib/promotion-badge
 */

/**
 * Returns the Tailwind CSS class for a promotion badge based on text content.
 * Centralizes membership-tier color mapping across the UI.
 *
 * @param {string} [badgeText] - Label text (e.g., "Gold Exclusive", "Silver Member").
 * @returns {string} Proper Tailwind background/text class.
 */
export function getPromotionBadgeClass(badgeText?: string): string {
    const upper = badgeText?.toUpperCase() ?? "";

    if (upper.includes("GOLD")) return "bg-[#BFA15F]";
    if (upper.includes("SILVER")) return "bg-[#A7A7AD]";
    if (upper.includes("DIAMOND")) return "bg-[#b9f2ff] text-[#0077b6]";

    return "bg-sale-red";
}
