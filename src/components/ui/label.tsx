/**
 * @file Accessible Label Primitive
 * @module components/ui/label
 * 
 * enhanced label component using Radix UI for automatic accessible linkage with input fields.
 * features peer-aware styling and brand-compliant typography.
 */

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { ComponentPropsWithRef } from "react";

/** defines stylistic variations for labels, including peer-disabled states. */
const labelVariants = cva(
  "text-sm font-medium leading-none text-stone-900 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);

/** properties for the Label component. */
interface LabelProps
  extends ComponentPropsWithRef<typeof LabelPrimitive.Root>,
  VariantProps<typeof labelVariants> { }

/**
 * standard label for form fields.
 * automatically dims when the associated peer input is disabled.
 */
const Label = ({
  className,
  ref,
  ...props
}: LabelProps) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
);

Label.displayName = LabelPrimitive.Root.displayName;

export { Label };