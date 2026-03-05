import { create } from 'zustand';
import { Product } from '@/types/product';
import { ProductSearchFilters } from '@/services/product.service';

interface CollectionState {
    products: Product[];
    lastPid: number | null;
    hasMore: boolean;
    scrollPosition: number;
    filters: ProductSearchFilters | null;
}

interface ProductStore {
    // We use a map to store states for different collection slugs/filters
    collections: Record<string, CollectionState>;

    // Actions
    setCollectionState: (key: string, state: Partial<CollectionState>) => void;
    getCollectionState: (key: string) => CollectionState | undefined;
    clearCollection: (key: string) => void;
}

/**
 * 🚀 Product Store (Zustand)
 * Purpose: Persist infinite scroll data and scroll position.
 * Advantage: Instant back-button recovery (Zero Skeleton flash).
 */
export const useProductStore = create<ProductStore>((set, get) => ({
    collections: {},

    setCollectionState: (key, state) => set((prev) => ({
        collections: {
            ...prev.collections,
            [key]: {
                ...(prev.collections[key] || {
                    products: [],
                    lastPid: null,
                    hasMore: true,
                    scrollPosition: 0,
                    filters: null
                }),
                ...state
            }
        }
    })),

    getCollectionState: (key) => get().collections[key],

    clearCollection: (key) => set((prev) => {
        const newCollections = { ...prev.collections };
        delete newCollections[key];
        return { collections: newCollections };
    })
}));
