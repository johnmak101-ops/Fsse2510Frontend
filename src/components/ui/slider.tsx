/**
 * @file Interactive Range Slider
 * @module components/ui/slider
 * 
 * A touch-friendly range input supporting dual thumbs for selecting numeric intervals.
 * built with Radix UI Slider for precise control and accessibility.
 */

"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "@/lib/utils"

/**
 * responsive slider component.
 * features branded stone-themed tracks and grab-interactive thumbs.
 */
function Slider({ className, ref, ...props }: React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & { ref?: React.Ref<HTMLSpanElement> }) {
  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn("relative flex w-full touch-none select-none items-center", className)}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-0.5 w-full grow overflow-hidden rounded-full bg-stone-200">
        <SliderPrimitive.Range className="absolute h-full bg-stone-900" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-stone-900 bg-white ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 disabled:pointer-events-none disabled:opacity-50 cursor-grab active:cursor-grabbing" />
      <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-stone-900 bg-white ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 disabled:pointer-events-none disabled:opacity-50 cursor-grab active:cursor-grabbing" />
    </SliderPrimitive.Root>
  )
}

export { Slider }