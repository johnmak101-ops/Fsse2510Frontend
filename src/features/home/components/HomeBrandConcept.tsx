/**
 * @file visual Brand philosophy showcase
 * @module features/home/components/HomeBrandConcept
 * 
 * renders a high-depth section conveying the core 'Dessert for Adults' brand concept.
 * utilizes GSAP `ScrollTrigger` for a professional from-to entrance animation.
 */

"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

/** branded vision section. */
export default function HomeBrandConcept() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(
      ".concept-content",
      { y: 40, opacity: 0 },
      {
        y: 0, opacity: 1,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
        },
      }
    );
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="bg-brand-primary/30 py-20 md:py-28 overflow-hidden">
      <div className="container mx-auto px-4 max-w-5xl concept-content text-center">

        {/* --- 1. SECTION TITLE (Serif + Tightened) --- */}
        <div className="mb-18">
          {/* Core Change: trcking-[0.25em] -> tracking-tighter */}
          <h2 className="font-serif text-[clamp(2rem,5vw,2.75rem)] text-brand-text uppercase leading-none">
            Brand Concept
          </h2>
        </div>

        {/* --- 2. HERO IMAGE --- */}
        <div className="relative aspect-[16/9] w-full mb-16 overflow-hidden rounded-2xl shadow-sm">
          <Image
            src="/images/background/media_desktop.webp"
            alt="Gelato Pique Boutique"
            fill
            className="object-cover transition-transform duration-1000 hover:scale-105"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
          />
        </div>

        {/* --- 3. DESCRIPTION AREA --- */}
        <div className="space-y-8 max-w-3xl mx-auto mb-14">
          {/* Slogan: Serif Italic (Maintain elegant contrast) */}
          <h3 className="font-serif text-[clamp(1.25rem,3vw,1.75rem)] italic text-brand-text/90 tracking-tight">
            &quot;Dessert for Adults&quot;
          </h3>

          {/* Body Text: Sans (Inter) - Maintain the original sense of breathing space */}
          <p className="font-sans text-brand-text/60 text-sm md:text-base leading-[1.8] tracking-wide font-light max-w-2xl mx-auto">
            Rooted in the concept of &quot;fashionable sweets,&quot; Gelato Pique redefines
            roomwear with an unwavering commitment to comfort and texture.
            We transform the lifestyle of every individual into a moment of
            pure indulgence.
          </p>
        </div>

        {/* --- 4. BUTTON --- */}
        <div>
          <Link
            href="/about"
            className="inline-block font-sans text-brand-text text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] border-b border-brand-text/20 pb-2 hover:text-gelato-pink hover:border-gelato-pink transition-all duration-300"
          >
            Discover More
          </Link>
        </div>
      </div>
    </section>
  );
}
