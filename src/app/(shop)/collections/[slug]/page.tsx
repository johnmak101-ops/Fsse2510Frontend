/**
 * @file Dynamic collections/Category Listing Page
 * @module app/(shop)/collections/[slug]/page
 * 
 * entry point for specific collection or category routes.
 * parses slugs to determine if the view should be filtered by collection name or category hierarchy.
 * leverages `productService` for real-time metadata (banners/titles) to ensure UI consistency.
 */

import Image from "next/image";
import { Suspense } from "react";
import ProductCollectionFilter from "@/features/product/components/ProductCollectionFilter";
import InfiniteProductGrid from "@/features/product/components/InfiniteProductGrid";
import { productService, ProductSearchFilters } from "@/services/product.service";
import { Skeleton } from "@/components/ui/skeleton";




interface CollectionMeta {
  title: string;
  banner: string;
  description: string;
}

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * 🚀 Filter Section (Streams independently)
 */
async function FilterSection({ title, showCategoryFilter }: { filters: ProductSearchFilters, title: string, showCategoryFilter: boolean }) {
  const attributes = await productService.getAttributes();
  return (
    <ProductCollectionFilter
      categoryTitle={title}
      attributes={attributes}
      showCategoryFilter={showCategoryFilter}
    />
  );
}

/**
 * 🚀 Product Grid Section (Streams independently)
 */
async function ProductGridSection({ filters }: { filters: ProductSearchFilters, isShopAll: boolean }) {
  const baseProducts = await productService.searchProducts(filters);

  if (baseProducts.content.length === 0) {
    return (
      <div className="py-40 text-center text-stone-300 italic font-serif">
        Currently no items available.
      </div>
    );
  }

  return (
    <InfiniteProductGrid
      initialData={baseProducts}
      filters={filters}
    />
  );
}

/**
 * 💀 Skeletons
 */
function FilterSkeleton() {
  return (
    <div className="flex justify-between items-center py-4">
      <Skeleton className="h-6 w-32" />
      <div className="flex gap-4">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-20" />
      </div>
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-4">
          <Skeleton className="aspect-3/4 w-full rounded-xl" />
          <div className="flex flex-col items-center gap-2 px-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function CollectionPage(props: CollectionPageProps) {
  const { slug } = await props.params;
  const query = await props.searchParams;

  const currentSlug = slug?.toLowerCase() || "all";
  const isShopAll = currentSlug === "all";

  const CATEGORY_SLUGS = ["unisex", "men", "women", "home", "pet", "pets"];
  const isCategoryPage = CATEGORY_SLUGS.includes(currentSlug);

  // Helper to handle string/array params
  const getParamArray = (val: string | string[] | undefined): string[] | undefined => {
    if (!val) return undefined;
    if (Array.isArray(val)) return val;
    return val.split(",").filter(Boolean);
  };

  const userSelectedCategories = getParamArray(query.categories);

  const filters: ProductSearchFilters = {
    sortBy: (Array.isArray(query.sortBy) ? query.sortBy[0] : query.sortBy) || "newest",
    categories: userSelectedCategories,
    category: (Array.isArray(query.category) ? query.category[0] : query.category) as string | undefined,
    collection: (Array.isArray(query.collection) ? query.collection[0] : query.collection) as string | undefined,
    productType: (Array.isArray(query.product_type) ? query.product_type[0] : query.product_type) as string | undefined,
    page: 0,
    limit: 20
  };

  if (query.price) {
    const priceP = Array.isArray(query.price) ? query.price[0] : query.price;
    const [min, max] = priceP.split("-").map(Number);
    if (!isNaN(min)) filters.minPrice = min;
    if (!isNaN(max)) filters.maxPrice = max;
  }

  // Handle defaults based on page type ONLY IF user hasn't selected categories
  if (isShopAll) {
    filters.collection = undefined;
  } else if (currentSlug === "new") {
    filters.isNew = true;
    filters.collection = undefined;
  } else if (isCategoryPage) {
    // Priority: If user clicked a filter (userSelectedCategories), use it.
    // Otherwise, use the page's base category.
    if (!userSelectedCategories || userSelectedCategories.length === 0) {
      filters.categories = [currentSlug === "pets" ? "pet" : currentSlug];
    }
  } else {
    filters.collection = currentSlug;
  }

  // Runtime Check: Fetch DB Metadata for Banner/Title (Replacing JSON)
  // If slug matches a Showcase Collection, use its Image/Title.
  let showcaseData: import("@/services/product.service").ShowcaseCollection[] = [];
  try {
    showcaseData = await productService.getShowcaseCollections();
  } catch (error) {
    console.error("CollectionPage: Failed to fetch metadata", error);
  }
  // Prioritize finding an item with a bannerUrl first
  let matchedCollection = showcaseData.find(c =>
    (c.tag?.toLowerCase() === currentSlug.toLowerCase() || c.title?.toLowerCase() === currentSlug.toLowerCase())
    && !!c.bannerUrl
  );

  // Fallback: If no dedicated banner item found, try finding any matching item (e.g. valid slider item)
  if (!matchedCollection) {
    matchedCollection = showcaseData.find(c =>
      (c.tag?.toLowerCase() === currentSlug.toLowerCase()) ||
      (c.title?.toLowerCase() === currentSlug.toLowerCase())
    );
  }

  const meta: CollectionMeta = matchedCollection ? {
    title: matchedCollection.title,
    banner: matchedCollection.bannerUrl || matchedCollection.imageUrl || "/images/category/default.jpg",
    description: `Discover our exclusive ${matchedCollection.title} collection.`
  } : {
    title: isShopAll ? "Shop All" : (currentSlug.charAt(0).toUpperCase() + currentSlug.slice(1)),
    banner: isShopAll ? "/images/category/all.jpg" : "/images/category/default.jpg",
    description: isShopAll ? "Discover our complete collection of comfortable essentials." : `Special Selection: ${currentSlug}`
  };

  return (
    <main className="flex flex-col w-full min-h-screen bg-[#FDFDFD] pb-32 pt-4 xl:pt-0">
      <section className="relative w-full h-[80vh] min-h-[600px] hidden xl:flex items-center justify-center overflow-hidden bg-stone-50">
        <div className="absolute inset-0">
          <Image
            src={meta.banner}
            alt={meta.title}
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/[0.02]" />
        </div>
      </section>

      <div className="w-full border-stone-100 bg-white sticky top-(--header-height) z-20">
        <div className="w-full px-6 md:px-10 lg:px-16">
          <Suspense fallback={<FilterSkeleton />}>
            <FilterSection filters={filters} title={meta.title} showCategoryFilter={!isCategoryPage && !isShopAll} />
          </Suspense>
        </div>
      </div>

      <section className="w-full px-4 md:px-8 lg:px-16 mt-16">
        <Suspense fallback={<GridSkeleton />}>
          <ProductGridSection filters={filters} isShopAll={isShopAll} />
        </Suspense>
      </section>
    </main>
  );
}
