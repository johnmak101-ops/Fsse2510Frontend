/**
 * @file User Management Service
 * @module services/user.service
 *
 * Implements authenticated profile retrieval, updates, and membership status tracking.
 */

import apiClient from "./api-client";

/** Profile update payload fields. */
export interface UpdateUserProfileRequest {
    fullName?: string;
    phoneNumber?: string;
    address?: string;
    birthday?: string; // ISO date string
}

/** Complete user profile and membership summary record. */
export interface User {
    uid: number;
    email: string;
    firebaseUid: string;
    fullName?: string;
    phoneNumber?: string;
    address?: string;
    birthday?: string;
    /** Whether the user has provided enough info to proceed with checkout. */
    isInfoComplete: boolean;
    membership?: {
        level: string;
        /** Bonus point multiplier or discount rate. */
        pointRate: number;
    };
    accumulatedSpending?: number;
    cycleSpending?: number;
    points?: number;
    cycleEndDate?: string;
    isInGracePeriod?: boolean;
}

/**
 * Retrieves the profile and membership level for the currently authenticated user.
 * Bypasses client-side cache to ensure fresh point balances.
 * @returns {Promise<User>} The full user data.
 */
export async function getCurrentUser(): Promise<User> {
    return await apiClient.get<User>("/users/me", { cache: 'no-store' });
}

/**
 * Modifies optional profile details like name or birthday.
 * @param {UpdateUserProfileRequest} data - The updated profile fields.
 * @returns {Promise<User>} The newly updated user profile.
 */
export async function updateUserProfile(data: UpdateUserProfileRequest): Promise<User> {
    return await apiClient.patch<User>("/users/profile", data);
}
