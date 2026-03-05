/**
 * @file immersive category entry point
 * @module features/product/components/ProductCategorySplit
 * 
 * renders a high-impact horizontal split view between primary store categories (e.g., Men/Women).
 * utilizes GSAP ScrollTrigger for staggered entrance animations to create a cinematic browsing experience.
 */

"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/** landing section component featuring hero-level category transitions. */
export default function ProductCategorySplit() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(".split-side", {
      opacity: 0,
      duration: 1.2,
      stagger: 0.2,
      ease: "power2.out",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 80%",
      }
    });
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="flex flex-col md:flex-row w-full overflow-hidden">

      {/* --- WOMEN'S SIDE --- */}
      <Link
        href="/collections/women"
        className="split-side relative w-full md:flex-1 aspect-[4/5] md:aspect-auto md:h-[90vh] group overflow-hidden border-b md:border-b-0 md:border-r border-white"
      >
        <Image
          src="https://images.johnmak.store/category-women.png"
          alt="Women's Collection"
          fill
          className="object-cover object-top transition-transform duration-[2s] group-hover:scale-102"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-sans text-white text-xs md:text-sm font-bold uppercase tracking-[0.4em] drop-shadow-md">
            Women&apos;s
          </span>
        </div>
      </Link>

      {/* --- MEN'S SIDE --- */}
      <Link
        href="/collections/men"
        className="split-side relative w-full md:flex-1 aspect-[4/5] md:aspect-auto md:h-[90vh] group overflow-hidden"
      >
        <Image
          src="https://images.johnmak.store/category-men.png"
          alt="Men's Collection"
          fill
          className="object-cover object-top transition-transform duration-[2s] group-hover:scale-102"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-sans text-white text-xs md:text-sm font-bold uppercase tracking-[0.4em] drop-shadow-md">
            Men&apos;s
          </span>
        </div>
      </Link>

    </section>
  );
}
