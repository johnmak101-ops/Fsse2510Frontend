/**
 * @file Protected Transaction Service
 * @module services/transaction.service
 *
 * Manage user-specific transactions, including state updates and history.
 */

import apiClient from "./api-client";
import { Transaction } from "../types/transaction";

export const transactionService = {
    /**
     * Retrieves the high-level transaction history for the currently logged-in user.
     * @returns {Promise<Transaction[]>} List of historic and active transactions.
     */
    async getTransactions(): Promise<Transaction[]> {
        return apiClient.get<Transaction[]>("/transactions");
    },

    /**
     * Fetches the complete details for a specific transaction.
     * @param {string} tid - Unique transaction tracking ID.
     * @returns {Promise<Transaction>} Full transaction record.
     */
    async getTransaction(tid: string): Promise<Transaction> {
        return apiClient.get<Transaction>(`/transactions/${tid}`);
    },

    /**
     * Explicitly marks a pending transaction as failed/aborted.
     * Used typically when a payment process is dismissed before completion.
     * @param {string | number} tid - Unique transaction identifier.
     * @returns {Promise<Transaction>} The updated transaction record.
     */
    async abortTransaction(tid: string | number): Promise<Transaction> {
        return apiClient.patch<Transaction>(`/transactions/${tid}/fail`);
    },
};
