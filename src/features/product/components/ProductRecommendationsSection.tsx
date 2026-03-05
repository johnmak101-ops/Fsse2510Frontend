/**
 * @file global product Recommendations
 * @module features/product/components/ProductRecommendationsSection
 * 
 * renders a grid of suggested products based on general showcase metrics.
 * features a minimalist UI with immersive hover transitions for storefront discoverability.
 */

"use client";

import React, { useState, useEffect } from "react";
import { Product } from "@/types/product";
import { productService } from "@/services/product.service";
import Image from "next/image";
import Link from "next/link";

/** storefront recommendation block. */
export default function ProductRecommendationsSection() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const data = await productService.getShowcaseProducts(4);
                setProducts(data.content);
            } catch (err) {
                console.error("Failed to fetch recommendations:", err);
                setError(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecommendations();
    }, []);

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 animate-pulse">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-6">
                        <div className="aspect-[3/4] bg-stone-50 rounded-none" />
                        <div className="space-y-3 px-4 text-center">
                            <div className="h-4 bg-stone-50 rounded-none w-3/4 mx-auto" />
                            <div className="h-4 bg-stone-50 rounded-none w-1/2 mx-auto" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error || products.length === 0) {
        return <div className="text-center text-[#BAB3AE]">Failed to load recommendations.</div>;
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {products.map((product: Product) => (
                <Link key={product.pid} href={`/product/${product.slug || product.pid}`} className="block group">
                    <div className="space-y-6">
                        <div className="aspect-[3/4] relative bg-stone-50 rounded-none overflow-hidden shadow-sm">
                            <Image
                                src={product.imageUrl}
                                alt={product.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-1000"
                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                            />
                        </div>
                        <div className="text-center space-y-2 px-2">
                            <h4 className="text-[10px] font-bold text-black uppercase tracking-widest leading-relaxed line-clamp-2 h-8">{product.name}</h4>
                            <p className="font-serif text-lg text-black">${product.price}</p>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
