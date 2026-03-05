/**
 * @file wishlist Server Actions
 * @module app/actions/wishlist
 * 
 * facilitates wishlist mutations with automated cache invalidation.
 * ensures wishlist counts and lists remain consistent across the application.
 */

'use server';

import apiClient from "@/services/api-client";
import { revalidateTag } from "next/cache";

/**
 * adds a product to the user's personal wishlist.
 * requires an authenticated session (token).
 * 
 * @param pid - The unique product identifier.
 * @param token - optional authorization token.
 */
export async function addWishlistItemAction(pid: number, token?: string) {
    if (!pid) throw new Error("Product ID is required");

    try {
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
        await apiClient.post(`/wishlist/${pid}`, undefined, { headers });
        revalidateTag('wishlist', 'max');
        return { success: true };
    } catch (error) {
        console.error("Add Wishlist Item Failed:", error);
        return { success: false, error: "Failed to add item to wishlist" };
    }
}

/**
 * removes a product from the user's wishlist.
 */
export async function removeWishlistItemAction(pid: number, token?: string) {
    if (!pid) throw new Error("Product ID is required");

    try {
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
        await apiClient.delete(`/wishlist/${pid}`, { headers });
        revalidateTag('wishlist', 'max');
        return { success: true };
    } catch (error) {
        console.error("Remove Wishlist Item Failed:", error);
        return { success: false, error: "Failed to remove item from wishlist" };
    }
}
