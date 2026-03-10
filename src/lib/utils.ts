/**
 * @file Generic UI Utilities
 * @module lib/utils
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Safely merges Tailwind CSS classes using `clsx` and `tailwind-merge`.
 * Prevents class conflicts (e.g., multiple padding-top values).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number as a USD currency string using the browser's locale.
 * @param {number} amount - The numeric value to format.
 */
/**
 * Validates a redirect URL to prevent open-redirect attacks.
 * Only allows relative paths (starting with `/` but not `//`).
 */
export function getSafeRedirect(url: string | null): string {
  if (!url) return "/";
  if (url.startsWith("/") && !url.startsWith("//")) return url;
  return "/";
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'HKD',
  }).format(amount)
}
