/**
 * @file Transaction Domain Types
 * @module types/transaction
 */

/** Possible lifecycle states of a customer transaction. */
export enum PaymentStatus {
    /** Payment is being analyzed by a processor. */
    PROCESSING = "PROCESSING",
    /** Order confirmed and paid. */
    SUCCESS = "SUCCESS",
    /** Transaction cancelled or declined. */
    FAILED = "FAILED",
    /** Waiting for user interaction (Stripe redirect). */
    PENDING = "PENDING",
    /** Cart discarded or process closed by user. */
    ABORTED = "ABORTED"
}

/** Individual product snapshot as it appeared at the time of purchase. */
export interface TransactionProduct {
    /** Transaction Item ID. */
    tpid: number;
    pid: number;
    sku: string | null;
    size: string | null;
    color: string | null;
    name: string;
    description: string | null;
    imageUrl: string;
    price: number;
    quantity: number;
    subtotal: number;
}

/** Complete record of a completed or attempted purchase. */
export interface Transaction {
    /** Public tracking ID. */
    tid: number;
    buyerUid: number;
    /** Moment the transaction was finalized (ISO 8601). */
    datetime: string;
    status: PaymentStatus;
    /** Final monetary amount including points/discounts. */
    total: number;
    items: TransactionProduct[];
    /** Points deducted from balance for this order. */
    usedPoints: number;
    couponCode?: string;
    /** Points granted to the user after this order Success. */
    earnedPoints: number;
    previousLevel?: string;
    newLevel?: string;
}
