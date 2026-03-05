/**
 * @file visual collection Marquee
 * @module features/product/components/ProductCollectionMarquee
 * 
 * renders a high-quality vertical marquee of featured collection imagery.
 * designed as a visual-only navigation aid with immersive hover scaling and shadow depth.
 */

"use client";

import Link from "next/link";
import Image from "next/image";
import COLLECTIONS from "@/data/collections.json";
import { Marquee } from "@/components/ui/marquee";

/** high-impact visual carousel for collection exploration. */
export default function ProductCollectionMarquee() {
  return (
    <section className="bg-white overflow-hidden py-16 md:py-24 border-t border-stone-100">

      {/* --- 1. MINIMAL HEADER --- */}
      <div className="container mx-auto px-4 mb-12 text-center">
        {/* Keep only H2, aligned with the site-wide compact Serif style */}
        <h2 className="font-serif text-[clamp(2rem,5vw,3rem)] text-brand-text tracking-tighter">
          Explore Collections
        </h2>
      </div>

      {/* --- 2. VISUAL MARQUEE (NO TEXT) --- */}
      <div className="relative w-full">
        {/* Gradient Masks (For white background) */}
        <div className="absolute left-0 top-0 bottom-0 w-24 md:w-48 z-10 bg-gradient-to-r from-white to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 md:w-48 z-10 bg-gradient-to-l from-white to-transparent pointer-events-none" />

        <Marquee pauseOnHover className="[--duration:65s] [--gap:1.5rem] py-4">
          {COLLECTIONS.map((col) => (
            <Link
              key={col.id}
              href={col.link}
              className="relative w-[260px] md:w-[380px] aspect-[4/5] mx-3 shrink-0 overflow-hidden rounded-2xl group transition-all duration-700 hover:shadow-2xl"
            >
              {/* Image Only */}
              <Image
                src={col.image}
                alt={col.title}
                fill
                className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                sizes="(max-width: 768px) 260px, 380px"
              />

              {/* Subtle Overlay: Only show subtle depth on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
            </Link>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
