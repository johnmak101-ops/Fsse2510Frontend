/**
 * @file immersive storefront Hero carousel
 * @module features/home/components/HomeHeroCarousel
 * 
 * renders a high-impact, fullscreen-capable carousel for primary brand messaging.
 * features automated progression with visual progress bars, touch-based swipe gestures, and responsive aspect ratios.
 * implements LCP optimization by prioritizing the first slide's image load.
 */

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react";
import { cn } from "@/lib/utils";
import { useIsClient } from "@/hooks/useIsClient";

/** metadata for an individual hero slide. */
export interface HeroSlide {
  /** unique slide identifier. */
  id: number;
  /** primary image URL for desktop viewports. */
  imageSrc: string;
  /** optional portrait-optimized image for mobile viewports. */
  mobileImageSrc?: string;
  /** brief uppercase headline displayed above the main title. */
  tagline: string;
  /** primary display title (Serif). */
  title: string;
  /** secondary supporting text. */
  subtitle: string;
  /** text content for the primary action button. */
  ctaText: string;
  /** navigational target for the slide's primary action. */
  ctaLink: string;
}

/** properties for the HomeHeroCarousel component. */
interface HeroCarouselProps {
  /** collection of slide objects to cycle through. */
  slides: HeroSlide[];
  /** duration in milliseconds for each slide's visibility. */
  autoPlayInterval?: number;
}

/**
 * cinematic hero component.
 * handles dynamic viewport transitions and high-performance image scaling.
 */
export default function HomeHeroCarousel({
  slides,
  autoPlayInterval = 8000
}: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const mounted = useIsClient();
  const [isMobile, setIsMobile] = useState(false);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      next();
    } else if (isRightSwipe) {
      prev();
    }
  };

  const prev = () => {
    setCurrent((curr) => (curr === 0 ? slides.length - 1 : curr - 1));
    setProgress(0);
  };

  const next = useCallback(() => {
    setCurrent((curr) => (curr === slides.length - 1 ? 0 : curr + 1));
    setProgress(0);
  }, [slides.length]);

  // Check mobile state on mount and resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize(); // Initial check

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Slide animation logic
  useEffect(() => {
    if (!mounted) return;

    // setProgress(0); // Removed to prevent sync setState in effect
    const stepTime = 50;
    const stepAmount = 100 / (autoPlayInterval / stepTime);

    progressIntervalRef.current = setInterval(() => {
      setProgress((old) => (old >= 100 ? 100 : old + stepAmount));
    }, stepTime);

    const slideTimer = setTimeout(() => {
      next();
    }, autoPlayInterval);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      clearTimeout(slideTimer);

    };
  }, [current, autoPlayInterval, mounted, next]);

  if (!mounted) return <div className="aspect-[9/16] md:aspect-[2/1] bg-stone-900" />;

  return (
    // UPDATE: Mobile uses 9:16 (Portrait), Desktop uses 2:1 (Landscape)
    <div
      className="relative w-full overflow-hidden bg-stone-900 group aspect-[9/16] md:aspect-[2/1] touch-pan-y"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >

      {slides.map((slide: HeroSlide, index: number) => {
        const isActive = index === current;
        return (
          <div
            key={slide.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-2500 ease-in-out",
              isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            )}
          >
            <Link href={slide.ctaLink} className="block h-full w-full cursor-pointer relative">

              {/* --- DESKTOP IMAGE --- */}
              {!isMobile && (
                <div className="hidden md:block relative h-full w-full">
                  <Image
                    src={slide.imageSrc}
                    alt={slide.title}
                    fill
                    className={cn(
                      "object-cover object-top transition-transform duration-3000 ease-out",
                      isActive ? "scale-110" : "scale-100"
                    )}
                    // Fix: Only the first slide needs priority (LCP optimization)
                    priority={index === 0}
                    sizes="100vw"
                  />
                </div>
              )}

              {/* --- MOBILE IMAGE --- */}
              {isMobile && (
                <div className="block md:hidden relative h-full w-full">
                  <Image
                    src={slide.mobileImageSrc || slide.imageSrc}
                    alt={slide.title}
                    fill
                    className={cn(
                      "object-cover object-top transition-transform duration-3000 ease-out",
                      isActive ? "scale-120" : "scale-100"
                    )}
                    priority={index === 0}
                    sizes="100vw"
                  />
                </div>
              )}

              {/* Overlays & Content... (Unchanged) */}
              <div className="absolute inset-0 bg-black/10 z-[11]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-50 z-[12]" />
              {/* Top Gradient for Header Visibility */}
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/60 to-transparent z-[12]" />

              <div className="absolute bottom-24 md:bottom-16 left-0 right-0 flex justify-center z-20">
                <div className={cn("opacity-0", isActive && "animate-fade-in fill-mode-forwards")}>
                  <span className="inline-block rounded-full border border-white/30 bg-white/10 px-5 py-2 md:px-6 text-[10px] md:text-xs font-bold tracking-[0.25em] text-white backdrop-blur-md uppercase shadow-sm">
                    {slide.tagline}
                  </span>
                </div>
              </div>
            </Link>
          </div>
        );
      })}

      {/* Controls & Progress Dots... (Unchanged) */}
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); prev(); }}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 h-10 w-10 md:h-12 md:w-12 flex items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md hover:bg-white hover:text-brand-text transition-all opacity-0 group-hover:opacity-100"
      >
        <RiArrowLeftSLine size={24} />
      </button>

      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); next(); }}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 h-10 w-10 md:h-12 md:w-12 flex items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md hover:bg-white hover:text-brand-text transition-all opacity-0 group-hover:opacity-100"
      >
        <RiArrowRightSLine size={24} />
      </button>

      <div className="absolute bottom-10 md:bottom-8 left-0 right-0 z-30 flex flex-col items-center gap-4">
        <div className="flex gap-3">
          {slides.map((_, i: number) => (
            <button
              key={i}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrent(i); setProgress(0); }}
              className={cn(
                "h-1.5 md:h-2 rounded-full transition-all duration-500 shadow-sm",
                i === current ? "w-6 md:w-8 bg-white" : "w-1.5 md:w-2 bg-white/50 hover:bg-white/80"
              )}
            />
          ))}
        </div>
        <div className="w-full max-w-[150px] md:max-w-[200px] h-0.5 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
