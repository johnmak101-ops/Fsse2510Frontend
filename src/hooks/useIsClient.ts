/**
 * @file Client-side Detection Hook
 * @module hooks/useIsClient
 *
 * Safely detects if the code is executing in a browser environment.
 * Prevents hydration mismatch errors when rendering browser-only components.
 */

import { useSyncExternalStore } from 'react';

/**
 * Returns true if executing on the client, false on the server.
 * Uses `useSyncExternalStore` for robust hydration-safe detection.
 * @returns {boolean}
 */
export function useIsClient() {
    const isClient = useSyncExternalStore(
        () => () => { },
        () => true,
        () => false
    );
    return isClient;
}
