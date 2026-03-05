/**
 * @file Product Domain Types
 * @module types/product
 */

/** Core product entity representing a purchasable item. */
export interface Product {
    pid: number;
    name: string;
    description: string;
    imageUrl: string;
    /** Final calculated price after all active promotions are applied. */
    price: number;
    /** The fallback price if no promotions are active. */
    originalPrice?: number;
    /** Absolute monetary value saved. */
    discountAmount?: number;
    /** Fractional discount value (e.g., 0.2 represents 20% off). */
    discountPercentage?: number;
    stock: number;
    category: string;
    /** Triggered by the 'new' attribute on the backend. */
    isNew: boolean;
    /** Indicates if the price is currently lower than the original price. */
    isSale: boolean;
    /** The UUID/ID of the promotion specifically setting this product's price. */
    appliedPromotionId?: number;
    /** Short text for UI ribbons (e.g., "SALE", "HOT"). */
    promotionBadgeText?: string;
    isFeatured: boolean;
    featuredPriority: number;
    hasStock: boolean;
    slug: string;

    /** Nested variations for size/color selection. */
    inventories?: ProductInventory[];
    collection?: string;
    productType: string;
    /** Rich text metadata for product display pages. */
    details?: {
        story?: string;
        productIntro?: string;
        fabricInfo?: string;
        designStyling?: string;
        colorDisclaimer?: string;
        vendor?: string;
    };
    status?: string;
    /** List of secondary gallery images. */
    images?: ProductImage[];
    /** Semantic attributes for filtering and SEO. */
    tags?: string[];
}

/** Represents a secondary image for a product gallery. */
export interface ProductImage {
    id?: number;
    url: string;
    tag?: string;
}

/** Specific variant of a product (Size/Color combination). */
export interface ProductInventory {
    id?: number;
    size: string;
    color: string;
    stock: number;
    /** Unique Stock Keeping Unit for this variant. */
    sku: string;
    imageUrl?: string;
    stockReserved?: number;
    weight?: number;
}

/** Filter parameters accepted by the product search API. */
export interface ProductSearchFilters {
    collection?: string;
    categories?: string[];
    category?: string;
    sortBy?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
    lastPid?: number;
    color?: string[];
    size?: string[];
    tag?: string[];
    searchText?: string;
    productType?: string;
    isNew?: boolean;
}

/** Cursor-based slice response returned by paginated product endpoints. */
export interface SliceResponse<T> {
    content: T[];
    hasNext: boolean;
}

/** Showcase collection summary used for homepage grids and banners. */
export interface ShowcaseCollection {
    id: number;
    title: string;
    imageUrl?: string;
    bannerUrl?: string;
    tag: string;
}
