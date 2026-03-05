/**
 * @file Authentication State Store
 * @module features/auth/store/useAuthStore
 * 
 * Manages global authentication state including user profiles, Firebase tokens, 
 * and loading states. Integrated with Firebase Auth and syncs with the Cart store.
 */

import { create } from 'zustand';
import { UserProfile } from '@/types/user';
import { auth } from '@/lib/firebase';
import { useCartStore } from '@/features/cart/store/useCartStore';

/** State and actions for the authentication domain. */
interface AuthState {
    /** The currently logged-in user profile, or null if guest. */
    user: UserProfile | null;
    /** Current Firebase ID token for authenticated API requests. */
    idToken: string | null;
    /** True if the initial auth check is in progress. */
    isLoading: boolean;
    /** Updates the user profile in state. */
    setUser: (user: UserProfile | null) => void;
    /** Sets or clears the active ID token. */
    setIdToken: (token: string | null) => void;
    /** Toggles the loading indicator. */
    setLoading: (isLoading: boolean) => void;
    /** Performs Firebase sign-out and clears local session data. */
    logout: () => Promise<void>;
}

/** 
 * Global hook for accessing auth state.
 * Triggers a cart clear upon logout to maintain data privacy.
 */
export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    idToken: null,
    isLoading: true,
    setUser: (user) => set({ user }),
    setIdToken: (idToken) => set({ idToken }),
    setLoading: (isLoading) => set({ isLoading }),
    logout: async () => {
        try {
            // WHY: Ensure guest data isn't mixed with previous user data.
            useCartStore.getState().clearCart();
            await auth.signOut();
        } catch (error) {
            console.error("Logout Error:", error);
        }

        set({ user: null, idToken: null, isLoading: false });
    },
}));
