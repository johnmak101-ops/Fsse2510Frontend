/**
 * @file infinite scrolling Marquee
 * @module components/ui/marquee
 * 
 * A responsive, CSS-animated marquee component for displaying logos, testimonials, or promotional text.
 * supports vertical/horizontal direction, reverse motion, and pause-on-hover logic.
 */

import { cn } from "@/lib/utils";
import { ComponentPropsWithoutRef } from "react";

/** Configuration options for the Marquee component. */
interface MarqueeProps extends ComponentPropsWithoutRef<"div"> {
    /** Optional CSS class name to style the marquee container. */
    className?: string;
    /** If true, the animation runs in reverse direction. */
    reverse?: boolean;
    /** If true, the animation pauses when the user hovers over the container. */
    pauseOnHover?: boolean;
    /** The content to be duplicated and scrolled. */
    children: React.ReactNode;
    /** If true, scrolls vertically instead of horizontally. */
    vertical?: boolean;
    /** Number of content repetitions to ensure seamless looping on large screens. */
    repeat?: number;
}

/**
 * high-performance marquee using CSS keyframes.
 * ensures a seamless experience by calculating gaps and duplication dynamically.
 */
export function Marquee({
    className,
    reverse = false,
    pauseOnHover = false,
    children,
    vertical = false,
    repeat = 4,
    ...props
}: MarqueeProps) {
    return (
        <div
            {...props}
            className={cn(
                "group flex overflow-hidden p-2 [--duration:40s] [--gap:1rem] [gap:var(--gap)]",
                {
                    "flex-row": !vertical,
                    "flex-col": vertical,
                },
                className,
            )}
        >
            {Array(repeat)
                .fill(0)
                .map((_, i) => (
                    <div
                        key={i}
                        className={cn("flex shrink-0 justify-around [gap:var(--gap)]", {
                            "animate-marquee flex-row": !vertical,
                            "animate-marquee-vertical flex-col": vertical,
                            "group-hover:[animation-play-state:paused]": pauseOnHover,
                            "[animation-direction:reverse]": reverse,
                        })}
                    >
                        {children}
                    </div>
                ))}
        </div>
    );
}
