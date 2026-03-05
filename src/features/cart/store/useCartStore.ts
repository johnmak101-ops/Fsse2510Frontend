/**
 * @file Shopping Cart Store
 * @module features/cart/store/useCartStore
 * 
 * Manages the shopping cart lifecycle: local persistence, server synchronization, 
 * guest-to-user merging, and price calculations.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CartItem } from "@/types/cart";
import { cartService } from "@/services/cart.service";
import { addToCartAction, removeCartItemAction, updateCartItemAction } from "@/app/actions/cart";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";

/** Main state interface for the Cart feature. */
interface CartState {
  /** list of products in the current session. */
  items: CartItem[];
  /** Final total price (sum of item prices * quantities). */
  totalPrice: number;
  /** Pre-discount total for showing "You Saved" labels. */
  totalOriginalPrice: number;
  /** Cumulative count of all units in cart. */
  totalQuantity: number;
  /** Indicator for background server communication. */
  isSyncing: boolean;
  /** True once Zustand has loaded data from localStorage. */
  hasHydrated: boolean;

  // Actions
  /** Adds a new item or increments quantity if SKU already exists. */
  addItem: (item: CartItem) => Promise<void>;
  /** Removes all units of a specific SKU. */
  removeItem: (sku: string) => Promise<void>;
  /** Updates the quantity of a specific SKU with floor/ceiling checks. */
  updateQuantity: (sku: string, quantity: number) => Promise<void>;
  /** Resets the cart to an empty state. */
  clearCart: () => void;
  /** Replaces local items with fresh state from the server. */
  syncWithServer: (background?: boolean) => Promise<void>;
  /** Merges local guest items into the user's permanent server cart. */
  mergeGuestCartWithServer: (background?: boolean) => Promise<void>;
  /** Internal cleanup for data consistency. */
  purgeMalformedItems: () => void;
  /** Sets hydration status used for UI rendering guards. */
  setHydrated: () => void;

  // Internal tracking
  _updateDebounceTimer?: NodeJS.Timeout;
  /** SKUs currently being updated on the server (for loading states). */
  updatingSkus: Set<string>;
}

/** 
 * Helper: Safely retrieves the latest Firebase ID token.
 * Falls back to store state if immediate Auth check fails.
 */
const getToken = async () => {
  if (typeof window !== "undefined" && auth.currentUser) {
    try {
      return await auth.currentUser.getIdToken();
    } catch (e) {
      console.warn("[Cart] Failed to refresh token", e);
    }
  }
  return useAuthStore.getState().idToken || undefined;
};

/** Filters out items missing mandatory identification fields. */
const validateItems = (items: unknown[]): CartItem[] => {
  return (items as CartItem[]).filter(item => !!item.sku);
};

/** Centralized logic for computing cart grand totals. Includes rounding for currency precision. */
const calculateTotals = (items: CartItem[]) => {
  const totalPrice = Math.round(items.reduce((sum, item) => sum + item.price * item.cartQuantity, 0) * 100) / 100;
  const totalOriginalPrice = Math.round(items.reduce((sum, item) => {
    const original = item.originalPrice ?? item.price;
    return sum + original * item.cartQuantity;
  }, 0) * 100) / 100;
  const totalQuantity = items.reduce((sum, item) => sum + item.cartQuantity, 0);
  return { totalPrice, totalOriginalPrice, totalQuantity };
};

/**
 * Zustand Store: useCartStore
 * Uses standard persistence middleware mapped to 'gelato-pique-cart'.
 */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalPrice: 0,
      totalOriginalPrice: 0,
      totalQuantity: 0,
      updatingSkus: new Set(),
      isSyncing: false,
      hasHydrated: false,
      setHydrated: () => set({ hasHydrated: true }),

      addItem: async (newItem) => {
        if (!newItem.sku) return;

        const isAuth = !!useAuthStore.getState().user;
        const currentItems = get().items;
        const existingItem = currentItems.find((item) => item.sku === newItem.sku);

        let newItems;
        if (existingItem) {
          newItems = currentItems.map((item) =>
            item.sku === newItem.sku
              ? { ...item, cartQuantity: item.cartQuantity + newItem.cartQuantity }
              : item
          );
        } else {
          newItems = [...currentItems, newItem];
        }

        // Optimistic Update
        set({ items: newItems, ...calculateTotals(newItems) });

        if (isAuth) {
          try {
            const token = await getToken();
            const response = await addToCartAction(newItem.sku, newItem.cartQuantity, token);

            if (!response.success || !response.data) {
              throw new Error(response.error || "Failed to add item to server cart");
            }

            const validItems = validateItems(response.data);
            set({ items: validItems, ...calculateTotals(validItems) });
          } catch (error: unknown) {
            console.error("Failed to add item to server cart:", error);
            const errMsg = error instanceof Error ? error.message : "Failed to add item";
            toast.error(`"${newItem.name}" could not be added: ${errMsg}`);
            await get().syncWithServer();
            throw error;
          }
        }
      },

      removeItem: async (sku) => {
        const isAuth = !!useAuthStore.getState().user;
        const previousItems = get().items;
        const updatedItems = previousItems.filter((item) => item.sku !== sku);

        // Optimistic Update
        set({ items: updatedItems, ...calculateTotals(updatedItems) });

        if (isAuth && sku) {
          try {
            const token = await getToken();
            const response = await removeCartItemAction(sku, token);

            if (!response.success || !response.data) {
              throw new Error(response.error || "Failed to remove item from server cart");
            }

            const validItems = validateItems(response.data);
            set({ items: validItems, ...calculateTotals(validItems) });
          } catch (error: unknown) {
            const itemName = previousItems.find(i => i.sku === sku)?.name || "item";
            const errMsg = error instanceof Error ? error.message : "Please try again";
            toast.error(`"${itemName}" could not be removed: ${errMsg}`);
            await get().syncWithServer();
          }
        }
      },

      updateQuantity: async (sku, quantity) => {
        const item = get().items.find(i => i.sku === sku);
        if (!item) return;

        let finalQty = quantity;
        if (finalQty > item.stock) finalQty = item.stock;
        if (finalQty < 0) finalQty = 1;

        if (finalQty === item.cartQuantity) return;

        const isAuth = !!useAuthStore.getState().user;
        const previousState = {
          items: get().items,
          totalPrice: get().totalPrice,
          totalQuantity: get().totalQuantity
        };

        const updatedItems = previousState.items.map((item: CartItem) =>
          item.sku === sku ? { ...item, cartQuantity: finalQty } : item
        );

        // Optimistic Update
        set({ items: updatedItems, ...calculateTotals(updatedItems) });

        if (isAuth && sku) {
          const state = get();
          if (state._updateDebounceTimer) {
            clearTimeout(state._updateDebounceTimer);
          }

          // Debounce server updates to prevent API flooding during fast typing.
          const newTimer = setTimeout(async () => {
            set({ _updateDebounceTimer: undefined });
            set((state) => {
              const n = new Set(state.updatingSkus);
              n.add(sku);
              return { updatingSkus: n };
            });

            try {
              const token = await getToken();
              const response = await updateCartItemAction(sku, finalQty, token);

              if (!response.success || !response.data) {
                throw new Error(response.error);
              }

              const validItems = validateItems(response.data);
              set({ items: validItems, ...calculateTotals(validItems) });
            } catch (error: unknown) {
              const errMsg = error instanceof Error ? error.message : "Insufficient stock";
              const itemName = previousState.items.find(i => i.sku === sku)?.name || "item";
              toast.error(`"${itemName}" quantity update failed: ${errMsg} 😭`);

              // Immediate Rollback on failure.
              set({
                items: previousState.items,
                totalPrice: previousState.totalPrice,
                totalQuantity: previousState.totalQuantity
              });

              await get().syncWithServer();
            } finally {
              set((state) => {
                const n = new Set(state.updatingSkus);
                n.delete(sku);
                return { updatingSkus: n };
              });
            }
          }, 500);

          set({ _updateDebounceTimer: newTimer });
        }
      },

      syncWithServer: async (background = false) => {
        if (!background) set({ isSyncing: true });
        try {
          const rawItems = await cartService.getCart();
          const serverItems = validateItems(rawItems);
          set({ items: serverItems, ...calculateTotals(serverItems) });
        } catch {
          // Error handled by global client
        } finally {
          if (!background) set({ isSyncing: false });
        }
      },

      mergeGuestCartWithServer: async (background = false) => {
        const guestItems = get().items;
        if (guestItems.length === 0) {
          await get().syncWithServer(background);
          return;
        }

        if (!background) set({ isSyncing: true });
        try {
          const serverItems = await cartService.getCart();
          const serverSkus = new Set(serverItems.map(i => i.sku));

          // WHY: Only sync items not already present on server to avoid overriding server quantities.
          const newItems = guestItems.filter(item => !!item.sku && !serverSkus.has(item.sku));

          if (newItems.length > 0) {
            const batchItems = newItems.map(item => ({
              sku: item.sku,
              quantity: item.cartQuantity
            }));
            await cartService.syncCart(batchItems);

            // Fetch fresh state to ensure promotion engine results are reflected correctly.
            set({ items: [], totalPrice: 0, totalQuantity: 0 });
            await get().syncWithServer();
            toast.success("Shopping cart updated! ✨");
          } else {
            set({ items: serverItems, ...calculateTotals(serverItems) });
          }
        } catch {
          set({ items: [], totalPrice: 0, totalQuantity: 0 });
          await get().syncWithServer();
          toast.info("Shopping cart synced. ✨");
        } finally {
          if (!background) set({ isSyncing: false });
        }
      },

      purgeMalformedItems: () => {
        const { items } = get();
        const validItems = validateItems(items);
        if (validItems.length < items.length) {
          set({ items: validItems, ...calculateTotals(validItems) });
        }
      },

      clearCart: () => set({ items: [], totalPrice: 0, totalQuantity: 0 }),
    }),
    {
      name: "gelato-pique-cart",
      storage: createJSONStorage(() => localStorage),
      // WHY: Only persist data fields, not transient state like timers or sync flags.
      partialize: (state) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { updatingSkus, _updateDebounceTimer, isSyncing, hasHydrated, setHydrated, ...rest } = state;
        return rest;
      },
    }
  )
);
