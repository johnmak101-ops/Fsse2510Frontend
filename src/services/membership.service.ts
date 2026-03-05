/**
 * @file Membership Service
 * @module services/membership.service
 *
 * Handles membership configuration (admin) and tier information (public).
 */

import apiClient from "./api-client";
import type { MembershipConfig, UpdateMembershipConfigRequest, MembershipLevel } from "@/types/membership";

/**
 * Retrieves all membership level configurations.
 * Restricted to administrators only.
 * @returns {Promise<MembershipConfig[]>} All tier configs.
 */
export async function getMembershipConfigs(): Promise<MembershipConfig[]> {
    return await apiClient.get<MembershipConfig[]>("/admin/membership/configs");
}

/**
 * Updates the configuration rules for a specific membership tier.
 * Restricted to administrators only.
 * @param {MembershipLevel} level - The tier to update (e.g., BRONZE, GOLD).
 * @param {UpdateMembershipConfigRequest} data - The updated rules.
 * @returns {Promise<MembershipConfig>} The updated configuration.
 */
export async function updateMembershipConfig(
    level: MembershipLevel,
    data: UpdateMembershipConfigRequest
): Promise<MembershipConfig> {
    return await apiClient.put<MembershipConfig>(
        `/admin/membership/configs/${level}`,
        data
    );
}

/**
 * Fetches public-facing membership tier information for display on marketing/info pages.
 * @returns {Promise<MembershipConfig[]>} Public tier descriptions.
 */
export async function getPublicMembershipTiers(): Promise<MembershipConfig[]> {
    return await apiClient.get<MembershipConfig[]>("/public/membership/tiers");
}
