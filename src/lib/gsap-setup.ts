/**
 * @file GSAP Registry & Setup
 * @module lib/gsap-setup
 *
 * Centralizes GSAP plugin registration to ensure singletons across the app.
 * Exports pre-configured GSAP and Draggable instances.
 */

import gsap from "gsap";
import { Draggable } from "gsap/dist/Draggable";

// Only register plugins in the browser environment to avoid SSR errors.
if (typeof window !== "undefined") {
    gsap.registerPlugin(Draggable);
}

export { gsap, Draggable };
