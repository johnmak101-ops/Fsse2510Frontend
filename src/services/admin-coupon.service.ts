/**
 * @file Admin Coupon Service
 * @module services/admin-coupon.service
 *
 * Authenticated coupon management endpoints for administrators.
 */

import apiClient from "@/services/api-client";

/** Represents a discount coupon entity. */
export interface Coupon {
    code: string;
    description: string;
    discountType: "PERCENTAGE" | "FIXED";
    discountValue: number;
    minSpend: number;
    validUntil: string;
}

/** Request DTO for creating a new coupon. */
export interface CreateCouponRequest {
    code: string;
    description: string;
    discountType: "PERCENTAGE" | "FIXED";
    discountValue: number;
    minSpend: number;
    validUntil: string;
}

/** Request DTO for updating an existing coupon. */
export interface UpdateCouponRequest {
    description?: string;
    discountType?: "PERCENTAGE" | "FIXED";
    discountValue?: number;
    minSpend?: number;
    validUntil?: string;
}

export const adminCouponService = {
    /**
     * Retrieves all valid (active) coupons.
     * @returns {Promise<Coupon[]>} List of valid coupons.
     */
    async getValidCoupons(): Promise<Coupon[]> {
        return await apiClient.get<Coupon[]>("/admin/coupons/valid");
    },

    /**
     * Registers a new coupon in the system.
     * @param {CreateCouponRequest} data - The coupon details.
     * @returns {Promise<Coupon>} The newly created coupon.
     */
    async createCoupon(data: CreateCouponRequest): Promise<Coupon> {
        return await apiClient.post<Coupon>("/admin/coupons", data);
    },

    /**
     * Updates an existing coupon's metadata or rules.
     * @param {string} code - The unique coupon code.
     * @param {UpdateCouponRequest} data - The fields to update.
     * @returns {Promise<Coupon>} The updated coupon.
     */
    async updateCoupon(code: string, data: UpdateCouponRequest): Promise<Coupon> {
        return await apiClient.put<Coupon>(`/admin/coupons/${code}`, data);
    },

    /**
     * Deletes a coupon entirely from the system.
     * @param {string} code - The unique coupon code.
     * @returns {Promise<void>}
     */
    async deleteCoupon(code: string): Promise<void> {
        return await apiClient.delete<void>(`/admin/coupons/${code}`);
    }
};
