/**
 * @file Dynamic Navigation Service
 * @module services/navigation.service
 *
 * Manages the dynamic header/footer navigation tree.
 * Supports public fetching and admin CRUD operations.
 */

import apiClient from "./api-client";

/** Represents a single navigation menu item or tab. */
export interface NavigationItem {
    id: number;
    label: string;
    type: "TAB" | "DROPDOWN_ITEM";
    action_type: "FILTER_COLLECTION" | "FILTER_CATEGORY" | "FILTER_PRODUCT_TYPE" | "FILTER_CUSTOM" | "URL";
    action_value: string;
    parent_id: number | null;
    children: NavigationItem[];
    sort_order: number;
    is_new: boolean;
    is_active: boolean;
}

/** System-defined options used when building navigation actions. */
export interface NavigationOptions {
    collections: string[];
    categories: string[];
    tags: string[];
    productTypes: string[];
}

/** Payload for creating a new navigation entry. */
export interface CreateNavigationItemRequest {
    label: string;
    type: string;
    action_type: string;
    action_value: string;
    parent_id?: number | null;
    sort_order: number;
    is_new: boolean;
    is_active: boolean;
}

/** Partial payload for updating an existing navigation entry. */
export interface UpdateNavigationItemRequest {
    id: number;
    label?: string;
    type?: string;
    action_type?: string;
    action_value?: string;
    parent_id?: number | null;
    sort_order?: number;
    is_new?: boolean;
    is_active?: boolean;
}

export const navigationService = {
    /**
     * Fetches the full tree of active navigation items for display.
     * @returns {Promise<NavigationItem[]>} Nested navigation items.
     */
    getPublicNavigation: async (): Promise<NavigationItem[]> => {
        return await apiClient.get("public/navigation");
    },

    /**
     * Retrieves valid filter values (collections, categories) for navigation setup.
     * @returns {Promise<NavigationOptions>} Available options.
     */
    getNavigationOptions: async (): Promise<NavigationOptions> => {
        return await apiClient.get("admin/navigation/options");
    },

    /**
     * Appends a new item to the navigation tree.
     * @param {CreateNavigationItemRequest} data - Payload.
     * @returns {Promise<NavigationItem>} Created item.
     */
    createItem: async (data: CreateNavigationItemRequest): Promise<NavigationItem> => {
        return await apiClient.post("admin/navigation", data);
    },

    /**
     * Modifies an existing navigation item.
     * @param {number} id - Item identifier.
     * @param {UpdateNavigationItemRequest} data - Updated fields.
     * @returns {Promise<NavigationItem>} Updated item.
     */
    updateItem: async (id: number, data: UpdateNavigationItemRequest): Promise<NavigationItem> => {
        return await apiClient.put(`admin/navigation/${id}`, data);
    },

    /**
     * Permanently removes an item from the navigation tree.
     * @param {number} id - Item identifier.
     */
    deleteItem: async (id: number): Promise<void> => {
        await apiClient.delete(`admin/navigation/${id}`);
    },

    /**
     * Force-reinitializes the navigation tree from default seed data.
     * Useful for recovery or first-time setup.
     */
    initData: async (): Promise<void> => {
        await apiClient.post("admin/navigation/init");
    }
};
