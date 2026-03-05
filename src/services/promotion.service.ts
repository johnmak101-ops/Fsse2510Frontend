/**
 * @file Promotion Service
 * @module services/promotion.service
 *
 * Admin and public promotion API operations.
 * Admin endpoints require authentication; public endpoints are unauthenticated.
 */

import apiClient from "@/services/api-client";

/**
 * All supported promotion types, grouped by scope.
 *
 * - **Item-level**: Discounts applied to specific products, categories, collections, or tags.
 * - **Order-level**: Discounts triggered by cart quantity or amount thresholds.
 * - **Contextual**: Discounts based on user identity (membership) or store-wide events.
 */
export enum PromotionType {
    // --- Item-level ---
    SPECIFIC_PRODUCT_DISCOUNT = "SPECIFIC_PRODUCT_DISCOUNT",
    SPECIFIC_CATEGORY_DISCOUNT = "SPECIFIC_CATEGORY_DISCOUNT",
    SPECIFIC_COLLECTION_DISCOUNT = "SPECIFIC_COLLECTION_DISCOUNT",
    SPECIFIC_TAG_DISCOUNT = "SPECIFIC_TAG_DISCOUNT",
    BUY_X_GET_Y_FREE = "BUY_X_GET_Y_FREE",
    BUNDLE_DISCOUNT = "BUNDLE_DISCOUNT",

    // --- Order-level ---
    MIN_QUANTITY_DISCOUNT = "MIN_QUANTITY_DISCOUNT",
    MIN_AMOUNT_DISCOUNT = "MIN_AMOUNT_DISCOUNT",

    // --- Contextual ---
    MEMBERSHIP_DISCOUNT = "MEMBERSHIP_DISCOUNT",
    STOREWIDE_SALE = "STOREWIDE_SALE"
}

/** Read model for a promotion returned by the API. */
export interface Promotion {
    id: number;
    name: string;
    description?: string;
    type: PromotionType;
    startDate: string;
    endDate: string;
    minQuantity?: number;
    minAmount?: number;
    targetMemberLevel?: string;
    targetPids?: number[];
    targetCategories?: string[];
    targetCollections?: string[];
    targetTags?: string[];
    discountType?: "PERCENTAGE" | "FIXED";
    discountValue?: number;
    buyX?: number;
    getY?: number;
}

/** Write model for creating a new promotion. */
export interface CreatePromotionRequest {
    name: string;
    description?: string;
    type: PromotionType;
    startDate: string;
    endDate: string;
    minQuantity?: number;
    minAmount?: number;
    targetMemberLevel?: string;
    targetPids?: number[];
    targetCategories?: string[];
    targetCollections?: string[];
    targetTags?: string[];
    discountType?: "PERCENTAGE" | "FIXED";
    discountValue?: number;
    buyX?: number;
    getY?: number;
}

/** Partial write model for updating an existing promotion. */
export type UpdatePromotionRequest = Partial<CreatePromotionRequest>;

export const promotionService = {
    /** Fetches all promotions (admin). */
    async getAllPromotions(): Promise<Promotion[]> {
        return await apiClient.get<Promotion[]>("/admin/promotions");
    },

    /** Fetches a single promotion by ID (admin). */
    async getPromotionById(id: number): Promise<Promotion> {
        return await apiClient.get<Promotion>(`/admin/promotions/${id}`);
    },

    /** Creates a new promotion (admin). */
    async createPromotion(data: CreatePromotionRequest): Promise<Promotion> {
        return await apiClient.post<Promotion>("/admin/promotions", data);
    },

    /** Updates an existing promotion by ID (admin). */
    async updatePromotion(id: number, data: UpdatePromotionRequest): Promise<Promotion> {
        return await apiClient.put<Promotion>(`/admin/promotions/${id}`, data);
    },

    /** Deletes a promotion by ID (admin). */
    async deletePromotion(id: number): Promise<void> {
        return await apiClient.delete<void>(`/admin/promotions/${id}`);
    },

    /** Assigns a promotion to a specific product (admin). */
    async assignPromotionToProduct(promoId: number, pid: number): Promise<void> {
        return await apiClient.patch<void>(`/admin/promotions/${promoId}/assign/${pid}`);
    },

    /**
     * Fetches currently active promotions (public, no auth required).
     * Used by CartUpsellBanner to display "Add X more items" prompts.
     * @param types - Optional array of promotion types to filter by.
     */
    async getActivePromotions(types?: PromotionType[]): Promise<Promotion[]> {
        const params = types && types.length > 0
            ? `?type=${types.join('&type=')}`
            : '';
        return await apiClient.get<Promotion[]>(`/public/promotions/active${params}`);
    },
};
