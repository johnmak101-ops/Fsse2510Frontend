/**
 * @file polymorphic Social Authentication Button
 * @module components/auth/SocialLoginButton
 * 
 * handles third-party authentication triggers with branded icons and motion effects.
 * currently supports Google with extensible provider support.
 */

import React from "react";
import { motion } from "framer-motion";
import { RiGoogleFill } from "@remixicon/react";

/** properties for the SocialLoginButton component. */
interface SocialLoginButtonProps {
    /** callback function triggered on interaction. */
    onClick: () => void;
    /** prevents interaction and dims the button if true. */
    disabled?: boolean;
    /** The identity provider to use for authentication icon and label. */
    provider: "google";
}

/**
 * high-craft social auth button.
 * features border transitions and spring-based tap feedback.
 */
export function SocialLoginButton({ onClick, disabled, provider }: SocialLoginButtonProps) {
    return (
        <motion.button
            whileHover={{ borderColor: "#1c1917", color: "#1c1917" }}
            whileTap={{ scale: 0.99 }}
            onClick={onClick}
            disabled={disabled}
            type="button"
            className="w-full flex items-center justify-center gap-3 py-4 bg-transparent border border-stone-200 text-stone-500 font-bold tracking-[0.2em] rounded-none transition-all text-[11px] uppercase disabled:opacity-70"
        >
            {provider === "google" && <RiGoogleFill size={16} />}
            {provider.toUpperCase()}
        </motion.button>
    );
}
