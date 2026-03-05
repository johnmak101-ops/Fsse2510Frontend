/**
 * @file Admin Product Service
 * @module services/admin-product.service
 *
 * Authenticated CRUD operations for admin product management.
 * All write endpoints require an admin-level Firebase Auth token.
 * Read operations fall through to the public product API.
 */

import apiClient from "./api-client";
import { Product } from "@/types/product";

/** Request DTO for creating/updating a product inventory entry. */
export interface ProductInventoryRequestDto {
    sku: string;
    size?: string;
    color?: string;
    stock: number;
    stockReserved?: number;
    weight?: number;
}

/** Request DTO for attaching an image to a product. */
export interface ProductImageRequestDto {
    url: string;
    tag?: string;
}

/** Full request DTO for creating a new product. */
export interface CreateProductRequestDto {
    name: string;
    slug: string;
    /** Product visibility: "PUBLIC", "DRAFT", or "ARCHIVED". */
    status: string;
    description?: string;
    imageUrl?: string;
    price: number;
    category?: string;
    collection?: string;
    story?: string;
    isNew?: boolean;
    isSale?: boolean;
    shopifyId?: number;
    vendor?: string;
    productType?: string;
    mainCategory?: string;
    productIntro?: string;
    fabricInfo?: string;
    designStyling?: string;
    colorDisclaimer?: string;
    tags?: string[];
    images?: ProductImageRequestDto[];
    inventories?: ProductInventoryRequestDto[];
}

/** Partial DTO for updating an existing product. */
export type UpdateProductRequestDto = Partial<CreateProductRequestDto>;

export const adminProductService = {
    /**
     * Creates a new product.
     * @param data  - Product creation payload.
     * @param token - Optional pre-fetched auth token (server-side calls).
     */
    async createProduct(data: CreateProductRequestDto, token?: string): Promise<Product> {
        const options = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        return await apiClient.post<Product>(`/products`, data, options);
    },

    /**
     * Updates an existing product by PID.
     * @param pid   - Product ID.
     * @param data  - Fields to update.
     * @param token - Optional pre-fetched auth token.
     */
    async updateProduct(pid: number, data: UpdateProductRequestDto, token?: string): Promise<Product> {
        const options = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        return await apiClient.put<Product>(`/products/${pid}`, data, options);
    },

    /**
     * Deletes a product by PID.
     * @param pid   - Product ID.
     * @param token - Optional pre-fetched auth token.
     */
    async deleteProduct(pid: number, token?: string): Promise<void> {
        const options = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        await apiClient.delete<Product>(`/products/${pid}`, options);
    },

    /**
     * Updates only the product metadata (story, fabric info, etc.).
     * @param pid     - Product ID.
     * @param details - Metadata fields to update.
     * @param token   - Optional pre-fetched auth token.
     */
    async updateProductMetadata(pid: number, details: Product["details"], token?: string) {
        const options = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        return await apiClient.patch<Product>(`/products/${pid}/metadata`, { details }, options);
    },

    /**
     * Fetches a single product for the admin edit form.
     * Uses the public read endpoint since the admin controller has no dedicated GET.
     * @param pid   - Product ID.
     * @param token - Optional pre-fetched auth token.
     */
    async getProductForAdmin(pid: number, token?: string): Promise<Product> {
        const options = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        return await apiClient.get<Product>(`/public/products/${pid}`, options);
    }
};
