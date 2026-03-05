/**
 * @file Loading Placeholder Primitive
 * @module components/ui/skeleton
 * 
 * renders a pulsing placeholder to indicate loading state for asynchronous content.
 * fits the "soft pulse" aesthetic of the Gelato Pique theme.
 */

import { cn } from "@/lib/utils";
import type { ComponentPropsWithRef } from "react";

/**
 * skeleton loader component.
 * uses a stone-themed warm gray with CSS pulse animation.
 */

function Skeleton({
  className,
  ...props
}: ComponentPropsWithRef<"div">) {
  return (
    <div
      // --- Base Styles ---
      className={cn(
        // 1. Animation: Crucial! Using Tailwind's pulse animation (fade in/out loop)
        "animate-pulse" +

        // 2. Shape: Default rounded corners
        " rounded-md" +

        // 3. Color: Gelato Pique specific detail
        // General sites use bg-gray-200 (colder)
        // We use bg-stone-200/60 (warmer gray with reduced opacity), feeling softer and more gentle
        " bg-stone-200/60",

        className
      )}
      {...props}
    />
  );
}

export { Skeleton };