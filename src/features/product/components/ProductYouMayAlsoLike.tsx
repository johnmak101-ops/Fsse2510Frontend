/**
 * @file collection-aware Lateral recommendations (SSR)
 * @module features/product/components/ProductYouMayAlsoLike
 * 
 * renders a high-visibility suggestion grid based on shared collection associations.
 * designed to improve average order value by highlighting complementary items within a specific collection context.
 */

import { productService } from "@/services/product.service";
import ProductCard from "./ProductCard";
import ProductGridWrapper from "./ProductGridWrapper";

/** properties for the YouMayAlsoLike component. */
interface YouMayAlsoLikeProps {
    /** The collection identifier used to pull related products. */
    collection: string;
    /** The PID of the current product to ensure exclusion from the result set. */
    currentPid: number;
}

/** cross-product collection showcase. */
export default async function YouMayAlsoLike({ collection, currentPid }: YouMayAlsoLikeProps) {
    if (!collection || !currentPid) return null;

    let products = [];
    try {
        const response = await productService.getYouMayAlsoLike(collection, currentPid);
        products = response?.content || [];
    } catch (error) {
        console.error("Error fetching 'You May Also Like' products:", error);
        return null;
    }

    if (products.length === 0) return null;

    return (
        <section className="container mx-auto px-4 md:px-8 py-24 md:py-32 border-t border-stone-50">
            <div className="flex flex-col items-center mb-16 text-center">
                <h2 className="text-2xl md:text-3xl font-serif text-stone-900 mb-4 tracking-tight">
                    You May Also Like
                </h2>
                <div className="w-12 h-[1px] bg-stone-200" />
            </div>

            <ProductGridWrapper className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                {products.map((p) => (
                    <ProductCard key={p.pid} product={p} />
                ))}
            </ProductGridWrapper>
        </section>
    );
}
