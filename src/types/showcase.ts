/**
 * @file Showcase UI Types
 * @module types/showcase
 */

/** Logical collection of products highlighted on the homepage landing areas. */
export interface ShowcaseCollection {
    id: number;
    title: string;
    description?: string;
    imageUrl?: string;
    /** Large decorative image for full-width sections. */
    bannerUrl?: string;
    /** Internal tag used to query associated products. */
    tag: string;
    /** Rendering priority for stacking. */
    orderIndex: number;
    /** If false, the collection is hidden from the UI. */
    active: boolean;
}
