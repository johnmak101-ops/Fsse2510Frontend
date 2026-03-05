"use client";

import { useQuery } from "@tanstack/react-query";
import { productService, ShowcaseCollection } from "@/services/product.service";

/**
 * Custom hook for fetching showcase collections.
 * Extracted from ProductCollectionSlider to follow the React pattern:
 * data fetching logic belongs in hooks, not directly in components.
 */
export function useShowcaseCollections() {
    const { data, isLoading, error } = useQuery<ShowcaseCollection[]>({
        queryKey: ["showcase-collections"],
        queryFn: () => productService.getShowcaseCollections(),
        staleTime: 1000 * 60 * 10, // 10 min — collection data rarely changes
        select: (data) => (Array.isArray(data) ? data.filter((c) => !!c.imageUrl && !!c.tag) : []),
    });

    return {
        collections: data ?? [],
        isLoading,
        error,
    };
}
