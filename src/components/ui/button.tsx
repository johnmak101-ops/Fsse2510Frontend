/**
 * @file Button UI Primitive
 * @module components/ui/button
 * 
 * A polymorphic button component supporting multiple visual variants and sizes.
 * built with Radix UI Slot for seamless 'asChild' behavior.
 */

import * as React from "react";
import type { ComponentPropsWithRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/** Defines style variations for the Button component. */
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-brand-primary text-white hover:opacity-90 shadow-md hover:shadow-lg",
        destructive:
          "bg-red-500 text-white hover:bg-red-600 shadow-sm",
        outline:
          "border border-stone-200 bg-white hover:bg-stone-50 hover:text-stone-900 text-brand-primary",
        secondary:
          "bg-gelato-pink text-brand-primary hover:bg-gelato-pink-deep shadow-sm",
        ghost:
          "hover:bg-stone-100 hover:text-stone-900 text-stone-600",
        link:
          "text-brand-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-8 py-2",
        sm: "h-9 rounded-full px-4 text-xs",
        lg: "h-14 rounded-full px-10 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

/** Props for the Button component, extending native button and variant specs. */
export interface ButtonProps
  extends ComponentPropsWithRef<"button">,
  VariantProps<typeof buttonVariants> {
  /** If true, the button will render its child and pass props to it (Headless pattern). */
  asChild?: boolean;
}

/**
 * Fundamental interaction element. Supporting various branding-compliant states.
 * 
 * @example
 * <Button variant="secondary" size="lg">Shop Now</Button>
 */
export default function Button({
  className,
  variant,
  size,
  asChild = false,
  ref,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
}

Button.displayName = "Button";

export { buttonVariants };