/**
 * @file Authentication Guard Hook
 * @module hooks/useAuthGuard
 *
 * Provides client-side route protection. Redirects unauthenticated users
 * to the login page with an optional return path.
 */

"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useRouter } from "next/navigation";

/**
 * Reusable auth guard hook.
 * Monitors the auth state and replaces the current route if the user is missing.
 *
 * @param {string} [redirectTo="/login?redirect=/cart"] - The URL to redirect to on failure.
 */
export function useAuthGuard(redirectTo = "/login?redirect=/cart") {
    const { user, isLoading } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.replace(redirectTo);
        }
    }, [isLoading, user, router, redirectTo]);
}
