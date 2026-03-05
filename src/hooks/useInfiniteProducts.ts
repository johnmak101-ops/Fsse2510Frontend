/**
 * @file Infinite Loading Product Hook
 * @module hooks/useInfiniteProducts
 *
 * A composite hook combining TanStack Query infinite pagination, 
 * debounced search logic, and IntersectionObserver scroll detection.
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { useInfiniteQuery, InfiniteData } from "@tanstack/react-query";
import { productService, ProductSearchFilters, SliceResponse } from "@/services/product.service";
import { Product } from "@/types/product";

/** Configuration options for the infinite product list. */
interface UseInfiniteProductsOptions {
    /** Initial filters to apply to the API request. */
    filters?: ProductSearchFilters;
    /** Server-fetched data to seed the initial page. */
    initialData?: SliceResponse<Product>;
    /** Page size for pagination. */
    limit?: number;
    /** Whether to enable the debounced search logic. */
    enableSearch?: boolean;
    /** Debounce delay in milliseconds for search input. */
    debounceMs?: number;
}

/** Return shape containing list data, loading states, and intersection refs. */
interface UseInfiniteProductsReturn {
    products: Product[];
    loading: boolean;
    isFetchingNextPage: boolean;
    hasMore: boolean;
    error: Error | null;
    /** Attach this ref to an element at the bottom of the list to trigger loading. */
    triggerRef: React.RefObject<HTMLDivElement | null>;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    isSearching: boolean;
    totalCount: number;
}

/**
 * Reusable Hook for Infinite Product Scrolling + Search.
 * 
 * Functions:
 * 1. Manages internal search query state with debouncing.
 * 2. Fetches paginated product data using cursor-based offsets.
 * 3. Observes a trigger element to fetch the next page automatically.
 * 
 * @example
 * ```tsx
 * const { products, triggerRef, searchQuery, setSearchQuery } = useInfiniteProducts({
 *   initialData: serverProducts,
 *   enableSearch: true
 * });
 * ```
 * @param {UseInfiniteProductsOptions} [options={}] - Configuration options.
 * @returns {UseInfiniteProductsReturn} State and handlers for the infinite list.
 */
export function useInfiniteProducts({
    filters = {},
    initialData,
    limit = 20,
    enableSearch = false,
    debounceMs = 300,
}: UseInfiniteProductsOptions = {}): UseInfiniteProductsReturn {
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const triggerRef = useRef<HTMLDivElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);

    // Debounced Search Logic: Prevents excessive API calls during rapid typing.
    useEffect(() => {
        if (!enableSearch) return;

        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [searchQuery, debounceMs, enableSearch]);

    // Construct final API filters by merging base filters with search query and limit.
    const finalFilters: ProductSearchFilters = {
        ...filters,
        ...(enableSearch && debouncedSearch ? { searchText: debouncedSearch } : {}),
        limit,
    };

    // TanStack Infinite Query: Handles pagination state, caching, and background fetching.
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        error,
        isLoading,
    } = useInfiniteQuery<
        SliceResponse<Product>,
        Error,
        InfiniteData<SliceResponse<Product>>,
        string[],
        number | undefined
    >({
        // Stringify filters to ensure an object reference change doesn't break the query cache key.
        queryKey: ["products", JSON.stringify(finalFilters)],
        queryFn: async ({ pageParam }) => {
            return await productService.searchProducts({
                ...finalFilters,
                lastPid: pageParam as number | undefined,
            });
        },
        initialPageParam: undefined,
        getNextPageParam: (lastPage) => {
            if (!lastPage || !lastPage.hasNext) return undefined;
            const lastProduct = lastPage.content[lastPage.content.length - 1];
            return lastProduct?.pid;
        },
        // Only seed initialData if we aren't currently searching (initialData matches original filters).
        ...(initialData && !debouncedSearch && {
            initialData: {
                pages: [initialData],
                pageParams: [undefined],
            },
        }),
        staleTime: 1000 * 60 * 5, // Cache results for 5 minutes.
    });

    // Flatten nested pages from TanStack Query into a single product array for the component.
    const products = data?.pages.flatMap((page) => page.content) || [];

    // IntersectionObserver Initialization: Detects when the user scrolls to the bottom of the list.
    useEffect(() => {
        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            {
                threshold: 0.1,
                rootMargin: "600px", // Trigger fetch early for a "seamless" infinite scroll feel.
            }
        );

        if (triggerRef.current) {
            observerRef.current.observe(triggerRef.current);
        }

        return () => observerRef.current?.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    return {
        products,
        loading: isLoading,
        isFetchingNextPage,
        hasMore: hasNextPage ?? false,
        error: error as Error | null,
        triggerRef,
        searchQuery,
        setSearchQuery,
        isSearching: enableSearch && searchQuery !== debouncedSearch,
        totalCount: products.length,
    };
}
