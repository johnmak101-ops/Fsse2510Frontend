/**
 * @file responsive Product grid container
 * @module features/product/components/ProductGridWrapper
 * 
 * provides a standardized structural layout for multiple product cards.
 * implements a mobile-first grid system that scales from 2 to 4 columns based on viewport density.
 */

"use client";

import React from "react";
import { cn } from "@/lib/utils";

/** properties for the ProductGridWrapper component. */
interface ProductGridWrapperProps {
  /** collection of React nodes (typically ProductCards) to be rendered within the grid. */
  children: React.ReactNode;
  /** optional CSS classes for overriding or extending the grid layout. */
  className?: string;
}

/** standardized layout utility for product listings. */
export default function ProductGridWrapper({ children, className }: ProductGridWrapperProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-12 md:gap-x-8 md:gap-y-20",
        className
      )}
    >
      {children}
    </div>
  );
}