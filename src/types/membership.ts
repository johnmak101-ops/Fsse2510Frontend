/**
 * @file Membership Domain Types
 * @module types/membership
 */

/** Standard membership tiers acknowledged by the backend. */
export enum MembershipLevel {
    /** Guest or unregistered users. */
    NO_MEMBERSHIP = "NO_MEMBERSHIP",
    BRONZE = "BRONZE",
    SILVER = "SILVER",
    GOLD = "GOLD",
    DIAMOND = "DIAMOND",
}

/** Admin-facing configuration for a specific membership level. */
export interface MembershipConfig {
    level: MembershipLevel;
    /** Minimum lifetime spending required to attain this level. */
    minSpend: number;
    /** Reward points multiplier (0.01 - 1.00). */
    pointRate: number;
    /** Extension period to maintain level if spending drops. */
    gracePeriodDays: number;
}

/** Payload for administrative updates to membership rules. */
export interface UpdateMembershipConfigRequest {
    minSpend: number;
    pointRate: number;
    gracePeriodDays: number;
}

/** User-facing display labels for membership tiers. */
export const MEMBERSHIP_LEVEL_LABELS: Record<MembershipLevel, string> = {
    [MembershipLevel.NO_MEMBERSHIP]: "No Membership",
    [MembershipLevel.BRONZE]: "Bronze",
    [MembershipLevel.SILVER]: "Silver",
    [MembershipLevel.GOLD]: "Gold",
    [MembershipLevel.DIAMOND]: "Diamond",
};

/** Visual identifiers/badges for membership levels. */
export const MEMBERSHIP_LEVEL_ICONS: Record<MembershipLevel, string> = {
    [MembershipLevel.NO_MEMBERSHIP]: "🔒",
    [MembershipLevel.BRONZE]: "🥉",
    [MembershipLevel.SILVER]: "🥈",
    [MembershipLevel.GOLD]: "🥇",
    [MembershipLevel.DIAMOND]: "💎",
};

/**
 * Converts a backend decimal point rate into a whole percentage for display.
 * @param {number} rate - The decimal rate (e.g., 0.07).
 * @returns {number} Whole number percentage (e.g., 7.0).
 */
export function toPercentage(rate: number): number {
    // Fixes floating point multiplication precision issues.
    return Math.round(rate * 100 * 10000) / 10000;
}

/**
 * Converts a user-input whole percentage back into backend decimal format.
 * @param {number} percentage - The percentage (e.g., 7.1).
 * @returns {number} Decimal rate (e.g., 0.071).
 */
export function toDecimal(percentage: number): number {
    return Math.round((percentage / 100) * 1000000) / 1000000;
}

/**
 * Summary of user's current membership status.
 * @deprecated Use MembershipConfig or UserProfile for fresh data.
 */
export interface Membership {
    level: MembershipLevel;
    pointRate: number;
}
