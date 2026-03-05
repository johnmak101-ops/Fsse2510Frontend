/**
 * @file Administrative Showcase Service
 * @module services/showcase-admin.service
 *
 * CRUD operations for homepage showcase collections.
 * Private admin endpoints only.
 */

import apiClient from "./api-client";
import { ShowcaseCollection } from "@/types/showcase";

export const adminService = {
    /**
     * Retrieves all showcase collection summaries for administration.
     * @returns {Promise<ShowcaseCollection[]>} Admin-view of homepage collections.
     */
    getShowcaseCollections: async () => {
        return await apiClient.get<ShowcaseCollection[]>("/api/admin/showcase/collections");
    },

    /**
     * Saves or creates a showcase collection metadata entry.
     * @param {Partial<ShowcaseCollection>} data - The collection payload.
     * @param {string} [token] - Optional pre-fetched auth token.
     * @returns Updated collection metadata.
     */
    saveShowcaseCollection: async (data: Partial<ShowcaseCollection>, token?: string) => {
        const options = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        if (data.id) {
            return await apiClient.put(`/api/admin/showcase/collections/${data.id}`, data, options);
        }
        return await apiClient.post("/api/admin/showcase/collections", data, options);
    },

    /**
     * Permanently deletes a showcase collection.
     * @param {number} id - Collection identifier.
     * @param {string} [token] - Optional pre-fetched auth token.
     */
    deleteShowcaseCollection: async (id: number, token?: string) => {
        const options = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        return await apiClient.delete(`/api/admin/showcase/collections/${id}`, options);
    }
};
