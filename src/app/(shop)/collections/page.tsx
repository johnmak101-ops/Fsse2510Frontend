/**
 * @file Generic collections Listing Page
 * @module app/(shop)/collections/page
 * 
 * provides a unified interface for browsing products based on URL-driven search parameters.
 * maps "name" parameters to backend collection queries for SEO-friendly URLs.
 * implements streaming sections for filters and product grids using React Suspense.
 */

import { Suspense } from "react";
import ProductCollectionFilter from "@/features/product/components/ProductCollectionFilter";
import InfiniteProductGrid from "@/features/product/components/InfiniteProductGrid";
import { productService, ProductSearchFilters } from "@/services/product.service";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

interface CollectionPageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

async function FilterSection({ title }: { title: string }) {
  const attributes = await productService.getAttributes();
  return (
    <ProductCollectionFilter
      categoryTitle={title}
      attributes={attributes}
    />
  );
}

async function ProductGridSection({ filters }: { filters: ProductSearchFilters }) {
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

export default async function GenericCollectionPage(props: CollectionPageProps) {
  const query = await props.searchParams;

  const filters: ProductSearchFilters = {
    sortBy: query.sortBy || "newest",
    categories: query.categories ? query.categories.split(",").filter(Boolean) : undefined,
    color: query.color ? query.color.split(",").filter(Boolean) : undefined,
    size: query.size ? query.size.split(",").filter(Boolean) : undefined,
    tag: query.tag ? query.tag.split(",").filter(Boolean) : undefined,
    searchText: query.q,
    productType: query.product_type,
    collection: query.name, // Map URL 'name' to 'collection' filter
    page: 0,
    limit: 20
  };

  if (query.price) {
    const [min, max] = query.price.split("-").map(Number);
    if (!isNaN(min)) filters.minPrice = min;
    if (!isNaN(max)) filters.maxPrice = max;
  }

  const title = query.name || "Shop All";

  // Runtime Check: Fetch DB Metadata for Banner/Title
  let showcaseData: import("@/services/product.service").ShowcaseCollection[] = [];
  try {
    showcaseData = await productService.getShowcaseCollections();
  } catch (error) {
    console.error("GenericCollectionPage: Failed to fetch metadata", error);
  }

  // Prioritize finding an item with a bannerUrl first
  const matchedCollection = showcaseData.find(c =>
    (c.tag?.toLowerCase() === (query.name?.toLowerCase() || "")) && !!c.bannerUrl
  );

  const bannerImage = matchedCollection?.bannerUrl || "/images/category/all.webp";

  return (
    <main className="flex flex-col w-full min-h-screen bg-[#FDFDFD] pb-32 pt-20 md:pt-0">
      <section className="relative w-full h-[80vh] min-h-[600px] hidden xl:flex items-center justify-center overflow-hidden bg-stone-50">
        <div className="absolute inset-0">
          <Image
            src={bannerImage}
            alt={title}
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
            <FilterSection title={title} />
          </Suspense>
        </div>
      </div>

      <section className="w-full px-4 md:px-8 lg:px-16 mt-16">
        <Suspense fallback={<GridSkeleton />}>
          <ProductGridSection filters={filters} />
        </Suspense>
      </section>
    </main>
  );
}
