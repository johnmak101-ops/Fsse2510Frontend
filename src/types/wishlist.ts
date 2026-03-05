/**
 * @file Wishlist Segment Types
 * @module types/wishlist
 */

/** Minimal product metadata stored in the user's pinned favorites list. */
export interface WishlistItem {
    pid: number;
    slug: string;
    name: string;
    imageUrl: string;
    price: number;
    /** Text describing availability (e.g., "In Stock"). */
    stockStatus: string;
}
