/**
 * @file Product detail Page
 * @module app/(shop)/product/[slug]/page
 * 
 * serves as the detailed view for individual products.
 * supports resolution by both alphanumeric slugs and numeric IDs for legacy compatibility.
 * implements server-side caching and dynamic OpenGraph metadata generation for SEO.
 */

import { notFound } from "next/navigation";
import { Metadata } from "next";
import ProductDetailsClient from "@/features/product/components/ProductDetailsClient";
import Link from "next/link";
import { RiArrowRightSLine } from "@remixicon/react";
import { productService } from "@/services/product.service";
import { Product } from "@/types/product";
import { Suspense, cache } from "react";
import ProductYouMayAlsoLike from "@/features/product/components/ProductYouMayAlsoLike";

interface ProductPageProps {
    params: Promise<{ slug: string }>;
}

/** cached data fetcher to prevent redundant network requests across component tree. */
const getProduct = cache(async (slug: string): Promise<Product> => {
    if (/^\d+$/.test(slug)) {
        return await productService.getProductById(Number(slug));
    }
    return await productService.getProductBySlug(slug);
});

/** generates localized SEO metadata for social sharing and search indexing. */
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
    const { slug } = await params;
    try {
        const product = await getProduct(slug);
        return {
            title: `${product.name} | Gelato Pique Official`,
            description: `Shop the ${product.name}. ${product.category}. Experience the softest touch.`,
            openGraph: {
                images: [product.imageUrl || "/images/category/gift_default.svg"],
            },
        };
    } catch {
        return { title: "Product | Gelato Pique" };
    }
}

/** 
 * main entry for product viewing. 
 * renders a synchronized client component for variant selection and handles related product discovery.
 */
export default async function ProductPage({ params }: ProductPageProps) {
    const { slug } = await params;

    let product: Product;
    try {
        product = await getProduct(slug);
    } catch {
        return notFound();
    }

    return (
        <main className="min-h-screen bg-white pt-12 xl:pt-48">
            {/* 1. Breadcrumbs */}
            <nav className="container mx-auto px-4 md:px-8 py-4 md:py-6 flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase text-stone-400">
                <Link href="/" className="hover:text-black transition-colors">Home</Link>
                <RiArrowRightSLine size={12} className="text-stone-200" />
                <Link href={`/collections/${product.category.toLowerCase()}`} className="hover:text-black transition-colors">
                    {product.category}
                </Link>
                <RiArrowRightSLine size={12} className="text-stone-200" />
                <span className="text-stone-900 truncate max-w-37.5 md:max-w-none">
                    {product.name}
                </span>
            </nav>

            {/* 2. Main Product Content Section */}
            <ProductDetailsClient product={product} />

            {/* 3. You May Also Like (Collection-Based, Random) */}
            {product.collection && (
                <Suspense fallback={
                    <div className="container mx-auto px-4 md:px-8 py-24 md:py-32">
                        <RelatedProductsSkeleton />
                    </div>
                }>
                    <ProductYouMayAlsoLike collection={product.collection} currentPid={product.pid} />
                </Suspense>
            )}
        </main>
    );
}


function RelatedProductsSkeleton() {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-4 animate-pulse">
                    <div className="aspect-[3/4] bg-stone-100 w-full" />
                    <div className="h-4 bg-stone-100 w-3/4 mx-auto" />
                    <div className="h-4 bg-stone-100 w-1/2 mx-auto" />
                </div>
            ))}
        </div>
    );
}
