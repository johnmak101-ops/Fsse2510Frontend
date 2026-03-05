/**
 * @file Horizontal Infinite Loop Utility
 * @module lib/horizontal-loop
 *
 * A specialized GSAP utility for creating seamless, infinite horizontal sliders.
 * Handles element positioning, wrapping, responsiveness, and interaction (Next/Prev/ToIndex).
 * 
 * Adapted from GSAP Helper functions.
 */

import gsap from "gsap";

/** Configuration options for the horizontal loop animation. */
export interface HorizontalLoopConfig {
    /** Target pixels per second (speed). */
    speed?: number;
    /** If true, the loop will pause on initialization. */
    paused?: boolean;
    /** Snap to nearest 1px or specific increments. */
    snap?: number | false;
    /** Number of pixels to pad at the end of the line. */
    paddingRight?: number;
    /** If true, the sequence plays in reverse. */
    reversed?: boolean;
}

/** Return interface extending GSAP Timeline with custom navigation methods. */
export interface HorizontalLoopResult extends gsap.core.Timeline {
    /** Dynamic times array for index-based navigation. */
    times: number[];
    /** Animates to a specific item index. */
    toIndex: (index: number, vars?: gsap.TweenVars) => gsap.core.Tween;
    /** Animates to the next item. */
    next: (vars?: gsap.TweenVars) => gsap.core.Tween;
    /** Animates to the previous item. */
    prev: (vars?: gsap.TweenVars) => gsap.core.Tween;
}

/**
 * Creates a seamless horizontal loop of elements using GSAP.
 * 
 * Logic Overview:
 * 1. Calculates the absolute layout positions of all items.
 * 2. Places items side-by-side using `xPercent` to ensure responsiveness.
 * 3. Builds a master timeline where each item translates left and "wraps" 
 *    around to the right once it exits the container boundary.
 * 4. Injects navigation methods (`toIndex`, `next`, `prev`) into the timeline object.
 * 
 * @param {Element[]} items - The HTML elements to be looped.
 * @param {HorizontalLoopConfig} config - Configuration parameters.
 * @returns {HorizontalLoopResult} The GSAP timeline with control methods.
 */
export function horizontalLoop(items: Element[], config: HorizontalLoopConfig): HorizontalLoopResult {
    const vars = config || {};
    const tl = gsap.timeline({
        repeat: -1,
        paused: vars.paused,
        defaults: { ease: "none" },
        onReverseComplete: () => {
            tl.totalTime(tl.rawTime() + tl.duration() * 100);
        }
    }) as HorizontalLoopResult;

    const length = items.length;
    const startX = (items[0] as HTMLElement).offsetLeft;
    const times: number[] = [];
    const widths: number[] = [];
    const xPercents: number[] = [];
    let curIndex = 0;
    const pixelsPerSecond = (vars.speed || 1) * 100;
    const snap: (v: number) => number = vars.snap === false ? (v) => v : gsap.utils.snap(vars.snap || 1);
    let curX: number;
    let distanceToStart: number;
    let distanceToLoop: number;
    let item: Element;
    let i: number;

    /**
     * Step 1: Pre-calculate Item Mapping.
     */
    gsap.set(items, {
        xPercent: (idx, target) => {
            const w = parseFloat(gsap.getProperty(target, "width", "px") as string);
            widths[idx] = w;
            xPercents[idx] = snap(parseFloat(gsap.getProperty(target, "x", "px") as string) / w * 100 + (Number(gsap.getProperty(target, "xPercent")) || 0));
            return xPercents[idx];
        }
    });
    gsap.set(items, { x: 0 });

    /**
     * Step 2: Calculate Loop Boundaries.
     */
    const firstItem = items[0] as HTMLElement;
    const lastItem = items[length - 1] as HTMLElement;
    const itemWidth = firstItem.offsetWidth;
    const gap = 32; // Default gap between items if not provided via props.
    const totalWidth = lastItem.offsetLeft + itemWidth + gap - startX;

    /**
     * Step 3: Populate Timeline with individual element tweens.
     */
    for (i = 0; i < length; i++) {
        item = items[i];
        curX = xPercents[i] / 100 * widths[i];
        distanceToStart = (item as HTMLElement).offsetLeft - startX;
        distanceToLoop = distanceToStart + widths[i] * (gsap.getProperty(item, "scaleX") as number) + gap;

        tl.to(item, {
            xPercent: snap((curX - distanceToLoop) / widths[i] * 100),
            duration: distanceToLoop / pixelsPerSecond
        }, 0)
            .fromTo(item, {
                xPercent: snap((curX - distanceToLoop + totalWidth) / widths[i] * 100)
            }, {
                xPercent: xPercents[i],
                duration: (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond,
                immediateRender: false
            }, distanceToLoop / pixelsPerSecond)
            .add("label" + i, distanceToStart / pixelsPerSecond);

        times[i] = distanceToStart / pixelsPerSecond;
    }

    /**
     * Step 4: Define Index-based Navigation.
     */
    function toIndex(idx: number, varsObj?: gsap.TweenVars) {
        const updatedVars = varsObj || {};
        let targetIndex = idx;
        // Find the shortest path around the loop.
        if (Math.abs(targetIndex - curIndex) > length / 2) {
            targetIndex += targetIndex > curIndex ? -length : length;
        }
        const newIndex = gsap.utils.wrap(0, length, targetIndex);
        let time = times[newIndex];
        // Handle wrap-around time adjustment.
        if (time < tl.time() && targetIndex > curIndex) {
            time += tl.duration();
        }
        curIndex = newIndex;
        updatedVars.overwrite = true;
        return tl.tweenTo(time, updatedVars);
    }

    tl.next = (varsObj?: gsap.TweenVars) => toIndex(curIndex + 1, varsObj);
    tl.prev = (varsObj?: gsap.TweenVars) => toIndex(curIndex - 1, varsObj);
    tl.toIndex = (idx: number, varsObj?: gsap.TweenVars) => toIndex(idx, varsObj);
    tl.times = times;
    tl.progress(1, true).progress(0, true);

    return tl;
}
