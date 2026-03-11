/**
 * @file Admin User Management Service
 * @module services/admin-user.service
 *
 * Authenticated operations for admin user management.
 * All endpoints require an admin-level Firebase Auth token.
 */

import apiClient from "./api-client";

export interface AdminUserResponseDto {
    uid: string;
    email: string;
    isAdmin: boolean;
}

export const adminUserService = {
    /**
     * Gets all users from Firebase Auth.
     * @param token - Optional pre-fetched auth token (for server-side calls).
     */
    async getAllUsers(token?: string): Promise<AdminUserResponseDto[]> {
        return await apiClient.get<AdminUserResponseDto[]>('/admin/users', { token });
    },

    /**
     * Searches for users by email or UID (partial matching).
     * @param query - The search query (email or UID).
     * @param token - Optional pre-fetched auth token.
     */
    async searchUsers(query: string, token?: string): Promise<AdminUserResponseDto[]> {
        return await apiClient.get<AdminUserResponseDto[]>('/admin/users/search', { 
            token,
            searchParams: { query }
        });
    },

    /**
     * Sets the role for a specific user.
     * @param uid - The Firebase UID of the user.
     * @param role - 'ADMIN' or 'CUSTOMER'.
     * @param token - Optional pre-fetched auth token.
     */
    async setUserRole(uid: string, role: string, token?: string): Promise<string> {
        // backend expects @RequestBody SetUserRoleRequestDto { uid, role }
        return await apiClient.post<string>('/admin/users/set-role', { uid, role }, { token });
    }
};
