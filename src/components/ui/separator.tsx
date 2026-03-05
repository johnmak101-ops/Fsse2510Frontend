/**
 * @file visual Divider Primitive
 * @module components/ui/separator
 * 
 * A horizontal or vertical line used to separate content segments.
 * built on Radix UI Separator for accessibility and semantic clarity.
 */

import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cn } from "@/lib/utils";
import type { ComponentPropsWithRef } from "react";

/**
 * standard separator component.
 * handles orientation-specific sizing and decorative state.
 */

const Separator = ({
  className,
  orientation = "horizontal",
  decorative = true,
  ref,
  ...props
}: ComponentPropsWithRef<typeof SeparatorPrimitive.Root>) => (
  <SeparatorPrimitive.Root
    ref={ref}
    decorative={decorative}
    orientation={orientation}
    className={cn(
      // Base color: Light gray
      "shrink-0 bg-stone-200",
      // Orientation logic
      orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
      className
    )}
    {...props}
  />
);

Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };