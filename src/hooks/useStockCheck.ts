/**
 * @file Real-time Stock Verification Hook
 * @module hooks/useStockCheck
 *
 * Periodically polls the server for fresh stock levels and product status.
 * Used on product pages and drawers to prevent "add-to-cart" for sold-out items.
 */

import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/product.service";

/**
 * Monitors stock levels for a specific product via its slug or numeric ID.
 * Refetches on window focus and every 15 seconds.
 * 
 * @param {string} slug - The URL-friendly slug OR numeric PID of the product.
 */
export function useStockCheck(slug: string) {
    const { data, isFetching, isLoading, error } = useQuery({
        queryKey: ["product", slug],
        queryFn: async () => {
            // Determine if input is a numeric ID (fallback for path routing mixups).
            if (/^\d+$/.test(slug)) {
                return await productService.getProductById(Number(slug));
            }
            return await productService.getProductBySlug(slug);
        },
        refetchOnWindowFocus: true,
        refetchInterval: 15000,
        staleTime: 5000
    });
    return { data, isFetching, isLoading, error };
}
