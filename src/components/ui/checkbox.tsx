/**
 * @file Checkbox Interaction Primitive
 * @module components/ui/checkbox
 * 
 * A control that allows the user to toggle between checked and unchecked states.
 * heavily used in product filtering and legal consents. 
 */

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComponentPropsWithRef } from "react";

/**
 * standard checkbox component.
 * features a brand chocolate background when active and a soft square shape.
 */
const Checkbox = ({
  className,
  ref,
  ...props
}: ComponentPropsWithRef<typeof CheckboxPrimitive.Root>) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-stone-300 shadow-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-brand-primary data-[state=checked]:text-white data-[state=checked]:border-brand-primary",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check className="h-3 w-3" strokeWidth={3} />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
);

Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };