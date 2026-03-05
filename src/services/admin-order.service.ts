/**
 * @file Admin Order Management Service
 * @module services/admin-order.service
 *
 * Authenticated order/transaction management for administrators.
 */

import apiClient from "./api-client";
import { Transaction } from "@/types/transaction";

export const adminOrderService = {
    /**
     * Retrieves all system transactions.
     * @param {string} [token] - Optional pre-fetched auth token.
     * @returns {Promise<Transaction[]>} List of all orders.
     */
    async getAllOrders(token?: string): Promise<Transaction[]> {
        const options = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        return await apiClient.get<Transaction[]>('/admin/transactions', options);
    },

    /**
     * Fetches details for a specific transaction by its unique identifier.
     * @param {string} tid - Unique transaction ID.
     * @param {string} [token] - Optional pre-fetched auth token.
     * @returns {Promise<Transaction>} Transaction details.
     */
    async getOrderById(tid: string, token?: string): Promise<Transaction> {
        const options = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        return await apiClient.get<Transaction>(`/admin/transactions/${tid}`, options);
    }
};
