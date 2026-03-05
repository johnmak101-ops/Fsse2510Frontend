/**
 * @file storefront 'New Arrivals' section
 * @module features/product/components/ProductNewArrivals
 * 
 * fetches and displays the latest product additions to the catalog.
 * implements runtime data integrity checks to handle unexpected API response structures gracefully.
 */

"use client";

import { useState, useEffect } from 'react';
import Link from "next/link";
import ProductCard from "@/features/product/components/ProductCard";
import { Product } from '@/types/product';
import { productService } from '@/services/product.service';

/** high-impact storefront section for newly released items. */
export default function ProductNewArrivals() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await productService.getShowcaseProducts(12);
                // Runtime check for data integrity
                if (response && Array.isArray(response.content)) {
                    setProducts(response.content);
                } else {
                    console.warn("NewArrivals: Received unexpected data structure from API", response);
                    setProducts([]);
                }
            } catch (error) {
                console.error("Failed to fetch products for NewArrivals:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, []);

    return (
        <section className="bg-white py-24 border-b border-stone-50 text-center">
            <div className="container mx-auto px-4">
                <div className="mb-16">
                    <h2 className="font-serif text-[clamp(2.25rem,5vw,3rem)] tracking-tighter text-brand-text leading-tight mb-6">
                        New Arrivals
                    </h2>
                    <Link
                        href="/collections/new"
                        className="font-sans text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] border-b border-brand-text/20 pb-2 hover:text-gelato-pink hover:border-gelato-pink transition-all duration-300"
                    >
                        View All
                    </Link>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-16 animate-pulse">
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="flex flex-col gap-4">
                                <div className="aspect-[3/4] bg-stone-100 rounded-xl" />
                                <div className="h-4 bg-stone-100 w-3/4 mx-auto rounded" />
                                <div className="h-4 bg-stone-100 w-1/2 mx-auto rounded" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-16">
                        {products.length > 0 ? (
                            products.map((p) => (
                                <ProductCard key={p.pid} product={p} />
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-brand-text/40 italic">
                                No new arrivals available at the moment.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}
