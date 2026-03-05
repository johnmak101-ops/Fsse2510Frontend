/**
 * @file Shop generic Loading boundary
 * @module app/(shop)/loading
 * 
 * leverages `CinematicLoader` for a brand-aligned skeleton/transition state.
 */

import CinematicLoader from "@/components/ui/CinematicLoader";

/** 
 * default suspense fallback for shop routes.
 */
export default function Loading() {
    return <CinematicLoader />;
}
