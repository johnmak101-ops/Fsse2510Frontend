/**
 * @file Wishlist Service
 * @module services/wishlist.service
 *
 * Synchronizes user favorites across devices using the backend database.
 * Private authenticated endpoints only.
 */

import apiClient from "./api-client";
import { WishlistItem } from "../types/wishlist";

export const wishlistService = {
    /**
     * Retrieves the full list of products favored by the user.
     * @returns {Promise<WishlistItem[]>} The current wishlist.
     */
    async getWishlist(): Promise<WishlistItem[]> {
        return apiClient.get<WishlistItem[]>("/wishlist");
    },

    /**
     * Pins a product to the user's favorites list.
     * @param {number} pid - Target product ID.
     */
    async addWishlistItem(pid: number): Promise<void> {
        await apiClient.post(`/wishlist/${pid}`);
    },

    /**
     * Unpins a product from the user's favorites list.
     * @param {number} pid - Target product ID.
     */
    async removeWishlistItem(pid: number): Promise<void> {
        await apiClient.delete(`/wishlist/${pid}`);
    },
};
