/**
 * @file atmospheric brand Video background
 * @module features/home/components/HomeBrandMovie
 * 
 * renders a high-impact video background section with immersive content overlays.
 * implements Intersection Observer to play/pause the video automatically, optimizing browser resources and CPU usage.
 */

"use client";

import { useRef, useEffect } from "react";

/** video-driven brand experience section. */
export default function HomeBrandMovie() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.current?.play().catch(() => { });
        } else {
          videoRef.current?.pause();
        }
      },
      { threshold: 0.3 }
    );

    if (videoRef.current) observer.observe(videoRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative w-full bg-stone-900 overflow-hidden">

      {/* --- Full Width Video Container --- */}
      <div className="relative w-full h-[50vh] md:h-[70vh]">

        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          muted
          loop
          playsInline
        >
          <source src="/videos/brand-movie.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Overlay: Darken the video slightly so text is readable */}
        <div className="absolute inset-0 bg-black/20" />

        {/* --- Content Overlay (Like Hero) --- */}
        {/*  3. Text is now centered ON TOP of the video */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          <div className="space-y-4 animate-fade-in">

            {/* Subtitle */}
            <p className="text-xs font-bold tracking-[0.25em] text-white/90 uppercase border border-white/30 inline-block px-4 py-1 rounded-full backdrop-blur-sm">
              Autumn & Winter 2025
            </p>

            {/* Title */}
            <h2 className="font-serif text-4xl font-medium text-white md:text-6xl italic drop-shadow-md">
              Season Concept
            </h2>

            {/* Description (Optional - can be hidden if too messy) */}
            <p className="max-w-md mx-auto text-sm leading-relaxed text-white/80 font-medium">
              Embrace the warmth of our new collection. Soft textures and gentle colors.
            </p>

          </div>
        </div>

      </div>
    </section>
  );
}
