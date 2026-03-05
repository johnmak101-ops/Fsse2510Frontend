/**
 * @file Cart Service
 * @module services/cart.service
 *
 * Authenticated cart operations that proxy to the backend `/cart/items` endpoints.
 * All methods require a valid Firebase Auth token (injected automatically by api-client).
 */

import apiClient from "./api-client";
import { CartItem } from "@/types/cart";

export const cartService = {
    /** Retrieves the current user's full cart from the server. */
    getCart: (): Promise<CartItem[]> => {
        return apiClient.get<CartItem[]>("/cart/items");
    },

    /**
     * Adds an item to the cart or increments its quantity if it already exists.
     * @param sku      - Stock-keeping unit identifier.
     * @param quantity - Number of units to add.
     * @throws {Error} If `sku` is empty.
     */
    addCartItem: (sku: string, quantity: number): Promise<CartItem[]> => {
        if (!sku) throw new Error("SKU is required to add item to cart");
        return apiClient.put<CartItem[]>(`/cart/items/${sku}/${quantity}`);
    },

    /**
     * Updates the quantity for an existing cart item.
     * @param sku      - Stock-keeping unit identifier.
     * @param quantity - New absolute quantity.
     * @throws {Error} If `sku` is empty.
     */
    updateCartItem: (sku: string, quantity: number): Promise<CartItem[]> => {
        if (!sku) throw new Error("SKU is required to update item");
        return apiClient.patch<CartItem[]>(`/cart/items/${sku}/${quantity}`);
    },

    /**
     * Removes an item from the cart entirely.
     * @param sku - Stock-keeping unit identifier.
     * @throws {Error} If `sku` is empty.
     */
    removeCartItem: (sku: string): Promise<CartItem[]> => {
        if (!sku) throw new Error("SKU is required to remove item");
        return apiClient.delete<CartItem[]>(`/cart/items/${sku}`);
    },

    /**
     * Batch-syncs multiple guest cart items to the server in a single request.
     * Used during the guest-to-authenticated cart merge flow.
     * @param items - Array of `{ sku, quantity }` pairs to sync.
     * @returns Updated cart, or an empty array if input is empty.
     */
    syncCart: (items: { sku: string; quantity: number }[]): Promise<CartItem[]> => {
        if (!items || items.length === 0) return Promise.resolve([]);
        return apiClient.put<CartItem[]>("/cart/items/batch", items);
    },
};
