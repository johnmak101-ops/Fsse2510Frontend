/**
 * @file Pricing Formatting Utility
 * @module lib/format-price
 */

/**
 * Formats a numeric price into a fixed "$x.xx" display string.
 *
 * @param {number} price - The raw price value.
 * @returns {string} Formatted string (e.g., "$129.90").
 */
export function formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
}
