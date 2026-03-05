/**
 * @file Type-safe Search Query Parsers
 * @module lib/search-parsers
 * 
 * Defines `nuqs` parsers for handling complex URL state (ranges, arrays).
 * Maps UI filters to internal state with sensible defaults.
 */

import {
    createParser,
    parseAsArrayOf,
    parseAsString
} from 'nuqs/server';

/** Parser for numeric ranges serialized as 'min-max'. */
export const parseAsRange = createParser({
    parse: (query) => {
        if (!query) return null;
        const [min, max] = query.split('-').map(Number);
        if (isNaN(min) || isNaN(max)) return null;
        return [min, max] as [number, number];
    },
    serialize: (value) => value.join('-'),
});

/** Global search state definition. */
export const searchParsers = {
    sortBy: parseAsString.withDefault('newest'),
    price: parseAsRange.withDefault([0, 1000]),
    categories: parseAsArrayOf(parseAsString).withDefault([]),
    color: parseAsArrayOf(parseAsString).withDefault([]),
    size: parseAsArrayOf(parseAsString).withDefault([]),
    /** Maps to product_type filter. */
    productTypes: parseAsArrayOf(parseAsString).withDefault([]),
    /** Maps to tag/collection filter. */
    collections: parseAsArrayOf(parseAsString).withDefault([]),
    /** Raw search text query. */
    q: parseAsString.withDefault(''),
};
