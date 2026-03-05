/**
 * @file multiline Text Input Primitive
 * @module components/ui/textarea
 * 
 * handles larger text blocks with consistent branding and focal states.
 * features auto-sizing support and touch-friendly padding.
 */

import * as React from "react";
import type { ComponentPropsWithRef } from "react";
import { cn } from "@/lib/utils";

/** properties for the Textarea component. */
type TextareaProps = ComponentPropsWithRef<"textarea">;

/**
 * standard textarea component.
 * consistent with Input styles but allowing for multiline content.
 */
const Textarea = ({
    className,
    ref,
    ...props
}: TextareaProps) => {
    return (
        <textarea
            className={cn(
                "flex min-h-[80px] w-full rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm text-stone-900 shadow-sm transition-all placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            ref={ref}
            {...props}
        />
    );
};

Textarea.displayName = "Textarea";

export { Textarea };
