/**
 * @file Shipping Address Service
 * @module services/address.service
 *
 * Authenticated shipping address management for the current user.
 * Implements CRUD and default address toggle.
 */

import apiClient from "./api-client";

/** Represents a user's shipping address. */
export interface ShippingAddress {
    id: number;
    recipientName: string;
    phoneNumber: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    stateProvince?: string;
    postalCode?: string;
    isDefault: boolean;
}

/** Request DTO for creating or updating a shipping address. */
export interface CreateShippingAddressRequest {
    recipientName: string;
    phoneNumber: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    stateProvince?: string;
    postalCode?: string;
    isDefault?: boolean;
}

/**
 * Retrieves all shipping addresses for the currently authenticated user.
 * @returns {Promise<ShippingAddress[]>} List of addresses.
 */
export async function getAllAddresses(): Promise<ShippingAddress[]> {
    return await apiClient.get<ShippingAddress[]>("/addresses");
}

/**
 * Creates a new shipping address.
 * @param {CreateShippingAddressRequest} data - The address details.
 * @returns {Promise<ShippingAddress>} The newly created address.
 */
export async function createAddress(data: CreateShippingAddressRequest): Promise<ShippingAddress> {
    return await apiClient.post<ShippingAddress>("/addresses", data);
}

/**
 * Updates an existing shipping address by ID.
 * @param {number} id - Address identifier.
 * @param {CreateShippingAddressRequest} data - Updated address details.
 * @returns {Promise<ShippingAddress>} The updated address.
 */
export async function updateAddress(id: number, data: CreateShippingAddressRequest): Promise<ShippingAddress> {
    return await apiClient.put<ShippingAddress>(`/addresses/${id}`, data);
}

/**
 * Deletes a shipping address by ID.
 * @param {number} id - Address identifier.
 * @returns {Promise<void>}
 */
export async function deleteAddress(id: number): Promise<void> {
    return await apiClient.delete<void>(`/addresses/${id}`);
}

/**
 * Marks a specific address as the default shipping address.
 * @param {number} id - Address identifier.
 * @returns {Promise<ShippingAddress>} The updated address.
 */
export async function setDefaultAddress(id: number): Promise<ShippingAddress> {
    return await apiClient.patch<ShippingAddress>(`/addresses/${id}/default`);
}
