/**
 * @file Public Product Service
 * @module services/product.service
 *
 * Client-side and server-side service for fetching product data from
 * the public (unauthenticated) product API endpoints.
 * All read endpoints leverage Next.js ISR via `revalidate` tags.
 */

import apiClient from "@/services/api-client";
import { Product } from "@/types/product";

// Re-export shared types so existing imports from this module continue to work.
export type {
    ProductSearchFilters,
    SliceResponse,
    ShowcaseCollection,
} from "@/types/product";

import type { ProductSearchFilters, SliceResponse, ShowcaseCollection } from "@/types/product";

/** Aggregated filter attributes available for the product search sidebar. */
export interface ProductAttributes {
    categories: string[];
    sizes: string[];
    colors: string[];
    productTypes: string[];
    collections: string[];
    featuredCollections: string[];
}

export const productService = {
    /** Fetches the first page of all public products. */
    async getAllProducts(): Promise<SliceResponse<Product>> {
        return await apiClient.get<SliceResponse<Product>>("/public/products", {
            next: { revalidate: 60 }
        });
    },

    /** Fetches a single product by its numeric ID. */
    async getProductById(pid: number): Promise<Product> {
        return await apiClient.get<Product>(`/public/products/${pid}`, {
            next: { revalidate: 60 }
        });
    },

    /** Fetches a single product by its URL-friendly slug. */
    async getProductBySlug(slug: string): Promise<Product> {
        return await apiClient.get<Product>(`/public/products/slug/${slug}`, {
            next: { revalidate: 60 }
        });
    },


    /**
     * Fetches featured products for the homepage showcase section.
     * @param limit - Maximum number of showcase products (default 12).
     */
    async getShowcaseProducts(limit: number = 12): Promise<SliceResponse<Product>> {
        return await apiClient.get<SliceResponse<Product>>("/public/products/showcase", {
            searchParams: { limit },
            next: { revalidate: 60 }
        });
    },

    /**
     * Performs a filtered product search. Results are not cached because
     * the high number of filter combinations makes ISR impractical.
     * @param filters - Search criteria (category, price range, color, etc.).
     */
    async searchProducts(filters: ProductSearchFilters): Promise<SliceResponse<Product>> {
        return await apiClient.get<SliceResponse<Product>>("/public/products/search", {
            searchParams: { ...filters },
            cache: 'no-store'
        });
    },

    /**
     * Fetches aggregated product attributes for sidebar filters.
     * Revalidated every 12 hours to align with the backend cache cycle.
     */
    async getAttributes(): Promise<ProductAttributes> {
        return await apiClient.get<ProductAttributes>("/public/products/attributes", {
            next: { revalidate: 43200 }
        });
    },

    /** Fetches showcase collection metadata for the homepage carousel. */
    async getShowcaseCollections(): Promise<ShowcaseCollection[]> {
        return await apiClient.get<ShowcaseCollection[]>("/public/products/showcase/collections", {
            next: { revalidate: 0 }
        });
    },

    /**
     * Fetches "You May Also Like" suggestions based on the same collection.
     * @param collection - Collection slug to match against.
     * @param currentPid - PID of the current product (excluded from results).
     * @param limit      - Maximum number of suggestions (default 4).
     */
    async getYouMayAlsoLike(collection: string, currentPid: number, limit: number = 4): Promise<SliceResponse<Product>> {
        return await apiClient.get<SliceResponse<Product>>("/public/products/you-may-also-like", {
            searchParams: {
                collection,
                currentPid,
                limit
            },
            next: { revalidate: 60 }
        });
    }
};
