/**
 * @file interactive collection Showcase
 * @module features/home/components/HomeCollectionSlider
 * 
 * renders a high-performance, infinitely looping carousel for primary store collections.
 * integrates GSAP `Draggable` with a proxy element and `horizontalLoop` utility for smooth, momentum-based browsing.
 * implemented with a drag proxy to avoid layout jitter and ensure precise progress mapping during interaction.
 */

"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap, Draggable } from "@/lib/gsap-setup";
import { ShowcaseCollection } from "@/services/product.service";
import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react";
import { cn } from "@/lib/utils";
import { horizontalLoop } from "@/lib/horizontal-loop";

/** properties for the HomeCollectionSlider component. */
interface CollectionSliderProps {
    /** collection of items to display within the slider. */
    items: ShowcaseCollection[];
}

/** interactive collection showcase entry point. */
export default function HomeCollectionSlider({ items }: CollectionSliderProps) {
    const listRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const loopRef = useRef<gsap.core.Timeline | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isReady, setIsReady] = useState(false);

    const validItems = items?.filter(item => !!item.imageUrl) || [];

    useEffect(() => {
        if (!listRef.current || validItems.length === 0) return;

        const itemsElements = gsap.utils.toArray<Element>(listRef.current.children);

        const loop = horizontalLoop(itemsElements, {
            speed: 0.75,
            paused: true,
            paddingRight: 32
        });
        loopRef.current = loop;

        setIsReady(true);

        const onWheel = (e: WheelEvent) => {
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                e.preventDefault();
                loop.time(gsap.utils.wrap(0, loop.duration(), loop.time() + e.deltaX * 0.004));
            }
        };

        // Create a proxy for dragging to decouple interaction from the visual list
        // This prevents layout shifts and improves performance during rapid drag gestures
        const dragProxy = document.createElement("div");

        let startProgress = 0;
        const draggable = Draggable.create(dragProxy, {
            type: "x",
            trigger: listRef.current,
            inertia: true,
            onDragStart() {
                setIsDragging(true);
                startProgress = loop.progress();
            },
            onDrag: function () {
                const totalWidth = (itemsElements[length - 1] as HTMLElement).offsetLeft +
                    (itemsElements[length - 1] as HTMLElement).offsetWidth +
                    32 - (itemsElements[0] as HTMLElement).offsetLeft;

                // Calculate movement delta relative to total track width
                // Map displacement to progress change [0, 1] for a natural, linear feel
                // Scale by 0.5 to reduce sensitivity to half as requested
                const change = ((this.startX - this.x) / totalWidth) * 0.5;
                loop.progress(gsap.utils.wrap(0, 1, startProgress + change));
            },
            onDragEnd() {
                // Short delay to ensure Link click is prevented during drag
                setTimeout(() => setIsDragging(false), 50);
            }
        });

        window.addEventListener("wheel", onWheel, { passive: false });

        return () => {
            window.removeEventListener("wheel", onWheel);
            draggable[0].kill();
            loop.kill();
        };
    }, [validItems.length]);

    const handleArrow = (direction: "left" | "right") => {
        if (!loopRef.current) return;
        if (direction === "left") {
            loopRef.current.prev({ duration: 0.25, ease: "power2.out" });
        } else {
            loopRef.current.next({ duration: 0.25, ease: "power2.out" });
        }
    };

    if (validItems.length === 0) return null;

    return (
        <section className="bg-[#F9F9F9] py-28 overflow-hidden relative group/section">
            <div className="container mx-auto px-4 mb-16 text-center">
                <h2 className="font-serif text-[clamp(2.25rem,5vw,3rem)] tracking-tighter text-[#1C1C1C] leading-tight mb-4">
                    Explore Collections
                </h2>
                <div className="font-sans text-[9px] uppercase tracking-[0.2em] text-[#1C1C1C]/30">
                    Scroll, Drag or Use Arrows to Explore
                </div>
            </div>

            <div className="relative w-full">
                <button
                    onClick={() => handleArrow("left")}
                    className="absolute left-8 top-1/2 -translate-y-1/2 z-20 p-4 rounded-full bg-white/80 backdrop-blur-md shadow-sm border border-stone-100 text-[#1C1C1C] opacity-0 group-hover/section:opacity-100 transition-all duration-500 hover:bg-[#1C1C1C] hover:text-white"
                >
                    <RiArrowLeftSLine size={20} />
                </button>
                <button
                    onClick={() => handleArrow("right")}
                    className="absolute right-8 top-1/2 -translate-y-1/2 z-20 p-4 rounded-full bg-white/80 backdrop-blur-md shadow-sm border border-stone-100 text-[#1C1C1C] opacity-0 group-hover/section:opacity-100 transition-all duration-500 hover:bg-[#1C1C1C] hover:text-white"
                >
                    <RiArrowRightSLine size={20} />
                </button>

                <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-linear-to-r from-[#F9F9F9] to-transparent z-10" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-linear-to-l from-[#F9F9F9] to-transparent z-10" />

                <div
                    ref={containerRef}
                    className={cn(
                        "relative w-full overflow-hidden transition-opacity duration-700",
                        isReady ? "opacity-100" : "opacity-0"
                    )}
                >
                    <div
                        ref={listRef}
                        className="flex gap-8 h-full cursor-grab active:cursor-grabbing will-change-transform"
                    >
                        {validItems.map((item, index) => (
                            <Link
                                key={`${item.id}-${index}`}
                                href={`/collections?name=${encodeURIComponent(item.tag)}`}
                                className="relative flex-none w-[300px] md:w-[500px] aspect-[4/5] overflow-hidden rounded-2xl group border border-stone-100"
                                onClick={(e) => isDragging && e.preventDefault()}
                            >
                                <div className="relative w-full h-full overflow-hidden">
                                    <Image
                                        src={item.imageUrl!}
                                        alt={item.title}
                                        fill
                                        draggable={false}
                                        className="object-cover"
                                        sizes="(max-width: 768px) 300px, 500px"
                                    />
                                    <div className="absolute inset-x-0 bottom-0 p-8 pt-20 bg-linear-to-t from-black/20 to-transparent">
                                        <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-white/90">
                                            {item.title}
                                        </span>
                                    </div>
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
