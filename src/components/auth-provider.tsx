/**
 * @file global Authentication Provider
 * @module components/auth-provider
 * 
 * Orchestrates Firebase authentication state changes with our custom backend.
 * Handles automatic logout on 401 responses and user profile synchronization.
 */

"use client";

import { ReactNode, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import apiClient from "@/services/api-client";
import { UserProfile } from "@/types/user";

/**
 * High-level provider that wraps the app to manage auth state lifecycle.
 * listens for Firebase auth events and syncs corresponding user data from the backend.
 */
export default function AuthProvider({ children }: { children: ReactNode }) {
    const { setUser, setIdToken, setLoading } = useAuthStore();

    /**
     * Effect: Global Unauthorized Listener.
     * intercepts 'auth:unauthorized' events dispatched by the API client (usually 401s).
     */
    useEffect(() => {
        const handleUnauthorized = () => {
            console.warn("Session expired. Logging out automatically.");
            useAuthStore.getState().logout().then(() => {
                window.location.href = "/";
            });
        };

        window.addEventListener("auth:unauthorized", handleUnauthorized);
        return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
    }, []);

    /**
     * Effect: Firebase Auth State Sync.
     * whenever Firebase user changes, updates Zustand store and fetches full profile from backend.
     */
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setLoading(true);
            if (firebaseUser) {
                const token = await firebaseUser.getIdToken();

                try {
                    // WHY: Manually inject token because store update might be asynchronous.
                    const userData = await apiClient.get<UserProfile>("/users/me", {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    setUser(userData);
                    setIdToken(token);
                } catch (error) {
                    console.error("Auth sync error:", error);
                    // NOTE: Fail-safe - user stays as null if backend sync fails.
                }
            } else {
                setUser(null);
                setIdToken(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [setUser, setIdToken, setLoading]);

    return <>{children}</>;
}
