/**
 * @file Accordion Layout Component
 * @module components/ui/accordion
 * 
 * A vertically stacked set of interactive headings that each reveal a section of content.
 * built on Radix UI Accordion primitives with custom brand styling.
 */

"use client"

import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { RiArrowDownSLine } from "@remixicon/react"
import { cn } from "@/lib/utils"

/** container for the accordion items. */
export const Accordion = AccordionPrimitive.Root

/** Represents a single collapsible section in the accordion. */
export function AccordionItem({ className, ...props }: React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      className={cn("border-b border-stone-100", className)}
      {...props}
    />
  )
}

/** The clickable header that toggles the collapse state. features a rotating arrow icon. */
export function AccordionTrigger({ className, children, ...props }: React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        className={cn(
          "flex flex-1 items-center justify-between py-4 text-xs font-bold uppercase tracking-widest transition-all hover:no-underline [&[data-state=open]>svg]:rotate-180",
          className
        )}
        {...props}
      >
        {children}
        <RiArrowDownSLine className="h-4 w-4 shrink-0 text-stone-400 transition-transform duration-300" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

/** The collapsible content area. features a slide-down animation. */
export function AccordionContent({ className, children, ...props }: React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div className={cn("pb-4 pt-0", className)}>{children}</div>
    </AccordionPrimitive.Content>
  )
}