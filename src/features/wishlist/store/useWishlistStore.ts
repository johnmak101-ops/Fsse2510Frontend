/**
 * @file Wishlist State Store
 * @module features/wishlist/store/useWishlistStore
 * 
 * Manages user's pinned favorites. Requires authentication for server-side persistence.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { WishlistItem } from "@/types/wishlist";
import { wishlistService } from "@/services/wishlist.service";
import { addWishlistItemAction, removeWishlistItemAction } from "@/app/actions/wishlist";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

/** State definition for the Wishlist feature. */
interface WishlistState {
    /** Cached list of favorite products. */
    items: WishlistItem[];
    /** Adds a product to the wishlist via server action. */
    addItem: (pid: number) => Promise<void>;
    /** Removes a product from the wishlist. */
    removeItem: (pid: number) => Promise<void>;
    /** Fetches the latest wishlist data from the API. */
    syncWithServer: () => Promise<void>;
}

/** Internal helper to retrieve the JWT. */
const getToken = () => {
    return useAuthStore.getState().idToken || undefined;
};

/** 
 * Global hook for accessing Wishlist state.
 * Uses localStorage persistence via 'gelato-pique-wishlist'.
 */
export const useWishlistStore = create<WishlistState>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: async (pid) => {
                const isAuth = !!useAuthStore.getState().user;
                if (!isAuth) return;

                try {
                    const token = getToken();
                    await addWishlistItemAction(pid, token);
                    await get().syncWithServer();
                } catch (error) {
                    console.error("Failed to add to wishlist:", error);
                }
            },

            removeItem: async (pid) => {
                const isAuth = !!useAuthStore.getState().user;
                if (isAuth) {
                    try {
                        const token = getToken();
                        await removeWishlistItemAction(pid, token);
                        await get().syncWithServer();
                    } catch (error) {
                        console.error("Failed to remove from wishlist:", error);
                    }
                } else {
                    // WHY: Allow guest removal if items were somehow persisted but user is logged out.
                    set({ items: get().items.filter(item => item.pid !== pid) });
                }
            },

            syncWithServer: async () => {
                try {
                    const serverItems = await wishlistService.getWishlist();
                    set({ items: serverItems });
                } catch (error) {
                    console.error("Failed to sync wishlist:", error);
                }
            },
        }),
        {
            name: "gelato-pique-wishlist",
            storage: createJSONStorage(() => localStorage),
        }
    )
);
