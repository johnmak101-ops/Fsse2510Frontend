/**
 * @file labeled Authentication Input Group
 * @module components/auth/InputGroup
 * 
 * A specialized input wrapper combining a stylized label, a borderless input field, and dynamic error messages.
 * primarily used in login and registration forms for a clean, minimalist aesthetic.
 */

import React from "react";

/** properties for the Auth InputGroup component. */
interface InputGroupProps extends React.InputHTMLAttributes<HTMLInputElement> {
    /** The descriptive text for the input field. */
    label: string;
    /** Optional error message to display beneath the input. */
    error?: string;
}

/**
 * atomic input group for auth flows.
 * features a high-contrast label and a subtle bottom-border interaction.
 */
export function InputGroup({ label, error, className, ...props }: InputGroupProps) {
    return (
        <div className="group space-y-1">
            <label className="text-[10px] font-bold tracking-[0.2em] text-stone-300 uppercase block mb-2">
                {label}
            </label>
            <input
                {...props}
                className={`w-full py-2 bg-transparent border-b border-stone-200 text-stone-800 text-sm font-bold tracking-widest focus:border-black focus:outline-none transition-colors rounded-none ${className}`}
                placeholder=""
            />
            {error && (
                <p className="text-red-500 text-[10px] uppercase tracking-wider font-bold mt-1">
                    {error}
                </p>
            )}
        </div>
    );
}
