/**
 * @file input Text Field Primitive
 * @module components/ui/input
 * 
 * generic text input with brand-compliant focal states and touch-friendly dimensions.
 */

import * as React from "react";
import type { ComponentPropsWithRef } from "react";
import { cn } from "@/lib/utils";

/** Base properties for the Input component. */
type InputProps = ComponentPropsWithRef<"input">;

/**
 * standard text input field.
 * features a rounded-xl shape to distinguish from pill-shaped buttons.
 */
const Input = ({
  className,
  type,
  ref,
  ...props
}: InputProps) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full px-4 py-2 rounded-xl border border-stone-200 bg-white shadow-sm transition-all text-sm text-stone-900 placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-stone-950",
        className
      )}
      ref={ref}
      {...props}
    />
  );
};

Input.displayName = "Input";

export { Input };