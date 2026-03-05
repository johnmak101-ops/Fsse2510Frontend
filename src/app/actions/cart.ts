/**
 * @file cart Server Actions
 * @module app/actions/cart
 * 
 * provides server-side logic for cart mutations with built-in cache revalidation.
 * these actions bridge the storefront UI and the backend API, ensuring inventory consistency.
 */

'use server';

import apiClient from "@/services/api-client";
import { CartItem } from "@/types/cart";
import { revalidateTag } from "next/cache";
import { getFriendlyErrorMessage } from "@/lib/error-utils";

/**
 * adds a specific SKU to the user's cart.
 * triggers a 'max' revalidation of the cart tag to ensure all cart views are updated.
 * 
 * @param sku - The product SKU to add.
 * @param quantity - number of items to add.
 * @param token - Optional authorization token for authenticated sessions.
 */
export async function addToCartAction(sku: string, quantity: number, token?: string) {
    if (!sku) throw new Error("SKU is required");

    try {
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
        const res = await apiClient.put<CartItem[]>(`/cart/items/${sku}/${quantity}`, undefined, { headers });
        revalidateTag('cart', 'max');
        return { success: true, data: res };
    } catch (error) {
        console.error("Add to Cart Failed:", error);
        return { success: false, error: getFriendlyErrorMessage(error) || "Failed to add item to cart" };
    }
}

/**
 * updates the quantity of an existing cart item via SKU.
 * partial updates ensure minimal data transfer while maintaining sync with the server.
 */
export async function updateCartItemAction(sku: string, quantity: number, token?: string) {
    if (!sku) throw new Error("SKU is required");

    try {
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
        const res = await apiClient.patch<CartItem[]>(`/cart/items/${sku}/${quantity}`, undefined, { headers });
        revalidateTag('cart', 'max');
        return { success: true, data: res };
    } catch (error) {
        console.error("Update Cart Item Failed:", error);
        return { success: false, error: getFriendlyErrorMessage(error) || "Failed to update item" };
    }
}

/**
 * removes an item from the cart.
 * performs a full removal of the SKU from the server-side session.
 */
export async function removeCartItemAction(sku: string, token?: string) {
    if (!sku) throw new Error("SKU is required");

    try {
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
        const res = await apiClient.delete<CartItem[]>(`/cart/items/${sku}`, { headers });
        revalidateTag('cart', 'max');
        return { success: true, data: res };
    } catch (error) {
        console.error("Remove Cart Item Failed:", error);
        return { success: false, error: getFriendlyErrorMessage(error) || "Failed to remove item" };
    }
}
