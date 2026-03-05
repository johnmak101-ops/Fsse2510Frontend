/**
 * @file high-performance Admin product browser
 * @module features/admin/components/AdminInfiniteProductTable
 * 
 * implements an infinitely scrolling table optimized for large-scale inventory management.
 * features real-time debounced search, total count tracking, and persistent ID mapping.
 * leverages `useInfiniteProducts` hook for efficient virtualization and data slicing.
 */

"use client";

import { useInfiniteProducts } from "@/hooks/useInfiniteProducts";
import { Product } from "@/types/product";
import { SliceResponse } from "@/services/product.service";
import Link from "next/link";
import Image from "next/image";
import { RiSettings4Line, RiSearchLine, RiCloseLine, RiLoader4Line } from "@remixicon/react";

/** properties for the InfiniteAdminProductTable component. */
interface InfiniteAdminProductTableProps {
    /** initial slice of data retrieved from server-side rendering for immediate display. */
    initialData: SliceResponse<Product>;
}

/** 
 * data-dense administrative product table. 
 * designed for operational speed with quick-access management links and instant filtering.
 */
export default function InfiniteAdminProductTable({ initialData }: InfiniteAdminProductTableProps) {

    const {
        products,
        loading,
        isFetchingNextPage,
        hasMore,
        error,
        triggerRef,
        searchQuery,
        setSearchQuery,
        isSearching,
        totalCount,
    } = useInfiniteProducts({
        initialData,
        enableSearch: true,
        limit: 50, // Admin can load more per page
        debounceMs: 300,
    });

    // Error State
    if (error) {
        return (
            <div className="py-20 text-center">
                <p className="text-red-500 font-bold mb-2">Failed to load products</p>
                <p className="text-stone-500 text-sm">{error.message}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 text-xs font-bold uppercase underline hover:text-stone-900"
                >
                    Retry
                </button>
            </div>
        );
    }

    // Empty State - No Products At All
    if (!loading && products.length === 0 && !searchQuery) {
        return (
            <div className="py-20 text-center">
                <p className="text-stone-400 font-serif text-lg mb-4">No products found</p>
                <Link
                    href="/admin/products/new"
                    className="inline-flex items-center gap-2 bg-stone-900 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-colors"
                >
                    Create First Product
                </Link>
            </div>
        );
    }

    // Empty State - No Search Results
    const isEmptySearch = !loading && products.length === 0 && searchQuery;

    return (
        <div className="space-y-6">
            {/* Search Input */}
            <div className="relative">
                <RiSearchLine size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                    type="text"
                    placeholder="Search products by name, ID, or slug..."
                    className="w-full pl-10 pr-24 py-2.5 border border-stone-200 rounded-lg text-sm bg-stone-50 focus:bg-white transition-all outline-none focus:ring-1 focus:ring-stone-900"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                {/* Loading Indicator */}
                {isSearching && (
                    <div className="absolute right-12 top-1/2 -translate-y-1/2">
                        <RiLoader4Line size={16} className="animate-spin text-stone-400" />
                    </div>
                )}
                {/* Clear Button */}
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-stone-100 rounded transition-colors"
                        title="Clear search"
                    >
                        <RiCloseLine size={16} className="text-stone-400" />
                    </button>
                )}
            </div>

            {/* Search Result Info */}
            {searchQuery && !loading && (
                <div className="flex items-center justify-between py-2 px-4 bg-stone-50 rounded-lg border border-stone-100">
                    <p className="text-xs text-stone-600">
                        {products.length > 0 ? (
                            <>
                                Showing <span className="font-bold">{totalCount}</span> result{totalCount !== 1 ? 's' : ''} for{' '}
                                <span className="font-bold">&ldquo;{searchQuery}&rdquo;</span>
                            </>
                        ) : (
                            <>No results found</>
                        )}
                    </p>
                    <button
                        onClick={() => setSearchQuery("")}
                        className="text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-stone-900 transition-colors"
                    >
                        Clear
                    </button>
                </div>
            )}

            {/* Empty Search Results */}
            {isEmptySearch && (
                <div className="py-12 text-center">
                    <p className="text-stone-400 font-serif text-lg mb-2">No products found</p>
                    <p className="text-sm text-stone-500 mb-4">
                        Try a different search term or{' '}
                        <button
                            onClick={() => setSearchQuery("")}
                            className="underline hover:text-stone-900 transition-colors font-medium"
                        >
                            clear your search
                        </button>
                    </p>
                </div>
            )}

            {/* Product Table */}
            {products.length > 0 && (
                <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-stone-50/50 border-b border-stone-100">
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone-400 w-16">ID</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Product</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Category</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-50">
                            {products.map((product) => (
                                <tr key={product.pid} className="hover:bg-stone-50/30 transition-colors group">
                                    <td className="px-6 py-4 font-mono text-[11px] text-stone-400">#{product.pid}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-stone-100 overflow-hidden relative border border-stone-100">
                                                {product.imageUrl && (
                                                    <Image
                                                        src={product.imageUrl}
                                                        alt={product.name}
                                                        width={40}
                                                        height={40}
                                                        className="object-cover"
                                                    />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-stone-900">{product.name}</p>
                                                <p className="text-[10px] text-stone-400 font-mono">{product.slug}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-[11px] text-stone-500 uppercase tracking-wider">{product.category}</td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={`/admin/products/${product.pid}`}
                                            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-stone-900 transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <RiSettings4Line size={16} /> Manage
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Infinite Scroll Trigger */}
            <div
                ref={triggerRef}
                className="h-32 flex items-center justify-center min-h-[128px]"
            >
                {isFetchingNextPage && (
                    <div className="flex items-center gap-2 text-stone-300 font-serif italic text-sm">
                        <RiLoader4Line size={16} className="animate-spin" />
                        <span>Loading more products...</span>
                    </div>
                )}
                {!hasMore && products.length > 0 && !isFetchingNextPage && (
                    <span className="text-stone-300 font-serif italic text-sm">
                        — Showing all {totalCount} product{totalCount !== 1 ? 's' : ''} —
                    </span>
                )}
            </div>
        </div>
    );
}
