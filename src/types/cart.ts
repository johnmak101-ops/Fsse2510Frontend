/**
 * @file Shopping Cart Domain Types
 * @module types/cart
 */

/** Individual item stored in the cart, keyed by SKU for variant specificity. */
export interface CartItem {
    pid: number;
    slug: string;
    /** The SKU is the unique identifier for a specific size/color variant. */
    sku: string;
    name: string;
    imageUrl: string;
    /** Current calculated price based on active promotions. */
    price: number;
    /** Pre-promotion price. */
    originalPrice?: number;
    /** The amount subtracted from originalPrice. */
    discountAmount?: number;
    /** Ratio of discount (e.g., 0.1 for 10% off). */
    discountPercentage?: number;
    /** Labels describing why a price was discounted. */
    promotionBadgeTexts?: string[];
    cartQuantity: number;
    /** Real-time stock available for this specific SKU. */
    stock: number;
    selectedSize?: string;
    selectedColor?: string;
    /** Tracks which promotions currently affect this cart entry. */
    appliedPromotionIds?: number[];
    category?: string;
    collection?: string;
    tags?: string[];
}

/** Consolidated cart state including computed totals. */
export interface Cart {
    items: CartItem[];
    totalPrice: number;
    totalQuantity: number;
}
