/**
 * @file Authentication Layout Wrapper
 * @module app/(auth)/layout
 * 
 * provides a consistent visual container for authentication-related pages (register, forgot-password).
 * implements a transparent passthrough for the login page to support its custom full-screen background video.
 */

"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

import { usePathname } from "next/navigation";

/** 
 * structural wrapper for auth flows. 
 * leverages `framer-motion` for entrance animations on non-login authentication forms.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === "/login";

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-brand-primary/20 flex items-center justify-center py-20 px-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-md"
            >
                {children}
            </motion.div>
        </div>
    );
}
