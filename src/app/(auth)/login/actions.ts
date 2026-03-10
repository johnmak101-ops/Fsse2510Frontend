/**
 * @file authentication Server Actions
 * @module app/actions/login
 * 
 * handles server-side authentication flows, specifically the synchronization between Firebase Auth and the Java backend.
 */

"use server";

import apiClient from "@/services/api-client";

/**
 * synchronizes the authenticated Firebase user with the Java performance backend.
 * ensures that the user's supplemental data (points, tiers) exists in the primary database.
 * 
 * @param token - The Firebase ID Token for verification.
 * @returns {Promise<{success: boolean, error?: string}>} result of the sync operation.
 */
export async function syncUserAction(token: string) {
    try {
        await apiClient.get("/users/me", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return { success: true };
    } catch (error: unknown) {
        if (process.env.NODE_ENV === 'development') console.error("[syncUserAction] FAILED.", error);
        const message = error instanceof Error ? error.message : "Failed to sync user";
        return { success: false, error: message };
    }
}
