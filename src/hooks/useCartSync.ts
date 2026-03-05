/**
 * @file Cart Synchronization Hook
 * @module hooks/useCartSync
 *
 * Orchestrates the initial hydration and server-side synchronization of the shopping cart.
 * Handles merging guest cart items with the server database upon login.
 */

import { useState, useEffect } from "react";
import { useCartStore } from "@/features/cart/store/useCartStore";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useAuthGuard } from "@/hooks/useAuthGuard";

/**
 * Hook to manage cart hydration and account-based syncing.
 * Ensures data integrity by purging malformed items on mount.
 */
export function useCartSync() {
    // Synchronize hydration state with the Zustand store to handle HMR and initial mount.
    const { hasHydrated, setHydrated } = useCartStore();
    const [mounted, setMounted] = useState(hasHydrated);

    const { user, isLoading: authLoading } = useAuthStore();
    const { isSyncing } = useCartStore();

    // Protect the cart route: direct unauthenticated users back to login.
    useAuthGuard("/login?redirect=/cart");

    // Initialization Effect: Purges invalid data and triggers server merge if authenticated.
    useEffect(() => {
        const initCart = async () => {
            setMounted(true);
            setHydrated(); // Mark hydration as complete in global state.
            useCartStore.getState().purgeMalformedItems();

            if (user) {
                // If local cart is empty, treat the sync as a background fetch.
                const isBackground = useCartStore.getState().items.length === 0;
                await useCartStore.getState().mergeGuestCartWithServer(isBackground);
            }
        };
        void initCart();
    }, [user, user?.uid, setHydrated]);

    return {
        mounted,
        isInitialSyncing: isSyncing,
        authLoading,
        user,
    };
}
