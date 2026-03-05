/**
 * @file Badge UI Primitive
 * @module components/ui/badge
 * 
 * A compact visual label for statuses, attributes, or category tags.
 * Designed with a signature rounded pill shape common in Gelato Pique branding.
 */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { ComponentPropsWithRef } from "react";

/** Defines stylistic variations for badges. */
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2",
  {
    variants: {
      variant: {
        /** default: Brand Chocolate filled. */
        default:
          "border-transparent bg-brand-primary text-white shadow-sm",
        /** secondary: Brand Pink (used for new arrivals/labels). */
        secondary:
          "border-transparent bg-gelato-pink text-brand-primary hover:bg-gelato-pink-deep",
        /** destructive: Soft red (used for Sale/Sold Out). */
        destructive:
          "border-transparent bg-red-50 text-red-600 hover:bg-red-100",
        /** outline: Stone-gray bordered with white background. */
        outline:
          "text-stone-600 border-stone-200 bg-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

/** Attributes for the Badge component. */
export interface BadgeProps
  extends ComponentPropsWithRef<"div">,
  VariantProps<typeof badgeVariants> { }

/**
 * Visual tag for highlighting specific product traits or statuses.
 */
export default function Badge({
  className,
  variant,
  ref,
  ...props
}: BadgeProps) {
  return (
    <div
      ref={ref}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

Badge.displayName = "Badge";

export { badgeVariants };
