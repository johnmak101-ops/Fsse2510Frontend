/**
 * @file Admin Order Management Service
 * @module services/admin-order.service
 *
 * Authenticated order/transaction management for administrators.
 */

import apiClient from "./api-client";
import { Transaction } from "@/types/transaction";
import { PaginatedResponse } from "@/types/pagination";

export const adminOrderService = {
    /**
     * Retrieves all system transactions with pagination.
     * @param {number} page - Page number (0-indexed).
     * @param {number} size - Page size.
     * @param {string} [token] - Optional pre-fetched auth token.
     * @returns {Promise<PaginatedResponse<Transaction>>} Paginated result of all orders.
     */
    async getAllOrders(page: number = 0, size: number = 20, token?: string): Promise<PaginatedResponse<Transaction>> {
        const options = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        return await apiClient.get<PaginatedResponse<Transaction>>(`/admin/transactions?page=${page}&size=${size}`, options);
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
    },

    /**
     * Manually updates the status of a transaction.
     * @param {string | number} tid - Unique transaction ID.
     * @param {string} status - New order status (e.g., 'SUCCESS', 'ABORTED', 'FAILED').
     * @param {string} [token] - Optional pre-fetched auth token.
     * @returns {Promise<Transaction>} Updated transaction details.
     */
    async updateOrderStatus(tid: string | number, status: string, token?: string): Promise<Transaction> {
        return await apiClient.patch<Transaction>(`/admin/transactions/${tid}/status`, undefined, {
            searchParams: { status },
            token
        });
    }
};
