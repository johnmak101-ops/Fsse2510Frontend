/**
 * @file performant Infinite catalog display
 * @module features/product/components/InfiniteProductGrid
 * 
 * orchestrates large-scale product listing with automated pagination and caching.
 * integrates TanStack Query for state management and Intersection Observer for seamless 'scroll-to-load' UX.
 * implements a 'Slice Strategy' using backend-driven hasNext flags for optimal traversal.
 */

"use client";

import { useEffect, useRef } from "react";
import { productService, ProductSearchFilters, SliceResponse } from "@/services/product.service";
import { Product } from "@/types/product";
import ProductCard from "./ProductCard";
import ProductGridWrapper from "./ProductGridWrapper";
import { useInfiniteQuery, InfiniteData } from "@tanstack/react-query";

/** properties for the InfiniteProductGrid component. */
interface Props {
    /** initial paginated results from SSR to ensure zero-shift hydration. */
    initialData: SliceResponse<Product>;
    /** collection of search/filter parameters to drive the data fetch. */
    filters: ProductSearchFilters;
}

/**
 * reactive product grid orchestrator.
 * handles dynamic refetching and error recovery for long-running browsing sessions.
 */
export default function InfiniteProductGrid({ initialData, filters }: Props) {
    // 1. TanStack Query for Infinite Scrolling
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
        error
    } = useInfiniteQuery<SliceResponse<Product>, Error, InfiniteData<SliceResponse<Product>>, (string | ProductSearchFilters)[], number | undefined>({
        queryKey: ["products", filters],
        queryFn: async ({ pageParam }) => {
            return await productService.searchProducts({
                ...filters,
                lastPid: pageParam as number | undefined,
                limit: 20
            });
        },
        initialPageParam: undefined,
        getNextPageParam: (lastPage) => {
            if (!lastPage || !lastPage.hasNext) return undefined;
            return lastPage.content[lastPage.content.length - 1].pid;
        },
        // Hydrate with initial data to prevent layout shift on first load
        initialData: {
            pages: [initialData],
            pageParams: [undefined],
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // 2. Flatten Pages into a single array
    const products = data?.pages.flatMap(page => page.content) || [];

    // 3. Intersection Observer for Infinite Scroll
    // We use a simple ref-callback or effect. 
    // React 19 doesn't strictly deprecate useEffect, just reduces need for memoization.
    const observerRef = useRef<IntersectionObserver>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

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
                rootMargin: '600px' // Load early
            }
        );

        if (triggerRef.current) observerRef.current.observe(triggerRef.current);

        return () => observerRef.current?.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
    // Effect dependency is still needed for re-binding if valid state changes, 
    // but React Compiler will optimize the deps array creation if enabled.

    if (status === 'error') {
        return (
            <div className="py-20 text-center">
                <p className="text-red-500 font-bold mb-2">Oops! Something went wrong.</p>
                <p className="text-stone-500 text-sm">{(error as Error).message}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 text-xs font-bold uppercase underline"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-10">
            <ProductGridWrapper className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-12">
                {products.map((product, index) => (
                    <ProductCard
                        key={`${product.pid}-${index}`} // Fallback index if duplicate pids occur rarely
                        product={product}
                        priority={index < 8}
                    />
                ))}
            </ProductGridWrapper>

            {/* Scroll Trigger */}
            <div
                ref={triggerRef}
                className="h-40 flex items-center justify-center min-h-[160px]"
            >
                {isFetchingNextPage && (
                    <span className="text-stone-300 font-serif italic text-sm animate-pulse">
                        Loading more treasures...
                    </span>
                )}
                {!hasNextPage && products.length > 0 && (
                    <span className="text-stone-300 font-serif italic text-sm">
                        — End of Collection —
                    </span>
                )}
            </div>
        </div>
    );
}
