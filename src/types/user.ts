/**
 * @file User Profile Domain Types
 * @module types/user
 */

import { Membership } from "./membership";

/** Detailed profile information and loyalty standing for a user. */
export interface UserProfile {
    uid: number;
    email: string;
    firebaseUid: string;
    membership: Membership;
    /** Cumulative lifetime spending for tier upgrades. */
    accumulatedSpending: number;
    /** Spending within the current membership cycle. */
    cycleSpending: number;
    /** Current spendable reward points. */
    points: number;
    /** Timestamp when current cycle expires. */
    cycleEndDate: string | null;
    /** True if user has missed a target but is in an extension period. */
    isInGracePeriod: boolean;
    fullName: string | null;
    phoneNumber: string | null;
    /** Default or last used shipping address summary. */
    address: string | null;
    birthday: string | null;
    /** User role (e.g., 'ADMIN', 'USER'). Defaults to 'USER' if omitted. */
    role?: 'ADMIN' | 'USER';
    /** Indicates if mandatory profile fields are populated. */
    isInfoComplete: boolean;
}
