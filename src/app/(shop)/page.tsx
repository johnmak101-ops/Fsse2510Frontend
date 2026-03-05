/**
 * @file Shop Homepage Entry
 * @module app/(shop)/page
 * 
 * serves as the landing experience for the Gelato Pique revamp.
 * orchestrates the delivery of hero promotions, category spotlights, and brand storytelling.
 * implements server-side fetching for showcase collection data with graceful error handling.
 */

import HomeHeroCarousel from "@/features/home/components/HomeHeroCarousel";
import ProductCategorySplit from "@/features/product/components/ProductCategorySplit";
import HomeBrandMovie from "@/features/home/components/HomeBrandMovie";
import ProductNewArrivals from "@/features/product/components/ProductNewArrivals";
import HomeCollectionSlider from "@/features/home/components/HomeCollectionSlider"; // Updated path
import HomeBrandConcept from "@/features/home/components/HomeBrandConcept";
import HomeBrandFinale from "@/features/home/components/HomeBrandFinale";
import HERO_SLIDES from "@/data/hero-slides.json";
import { productService } from "@/services/product.service";

/** 
 * main landing page component. 
 * asynchronously retrieves curated showcase items while maintaining a resilient fallback for UI stability.
 */
export default async function HomePage() {
  // Fetch real collections from database (Option B)
  let showcaseCollections: import("@/services/product.service").ShowcaseCollection[] = [];
  try {
    showcaseCollections = await productService.getShowcaseCollections();
  } catch (error) {
    console.error("HomePage: Failed to fetch showcase collections", error);
    // Silent fail to allow page to render the rest
  }

  return (
    <main className="flex flex-col w-full overflow-x-hidden bg-white">
      {/* 1. Hero Experience */}
      <HomeHeroCarousel slides={HERO_SLIDES} autoPlayInterval={8000} />

      {/* 2. Visual Atmosphere */}
      <HomeBrandMovie />

      <ProductCategorySplit />

      {/* 3. Commerce (White) */}
      <ProductNewArrivals />

      {/* 4. Collections Slider (#F5F6F6) */}
      <HomeCollectionSlider items={showcaseCollections} />

      {/* 5. Storytelling Philosophy (#F5F6F6) */}
      <HomeBrandConcept />

      {/* 5. Emotional Finale (Light Pink) */}
      <HomeBrandFinale />
    </main>
  );
}