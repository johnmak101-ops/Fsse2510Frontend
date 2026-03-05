/**
 * @file Cinematic Application Loader
 * @module components/ui/CinematicLoader
 * 
 * An elegant, SVG-animated loading screen with motion effects.
 * Displays during initial app hydration and major state transitions.
 */

"use client";

import React from "react";
import { motion } from "motion/react";

/**
 * Renders a full-screen loader with a breathing logo and animated trace.
 */
export default function CinematicLoader() {
    return (
        <motion.div
            key="intro-logo"
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
        >
            {/* Logo wrapper with continuous breathing animation */}
            <motion.div
                className="relative w-64 h-24 mb-6 flex items-center justify-center"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1.5
                }}
            >
                <svg viewBox="0 0 300 100" className="w-full h-full">
                    {/* Simulated "Gelato Pique" Cursive Path - Abstract Elegant Curves */}
                    <motion.path
                        d="M40,60 C40,60 50,30 70,30 C90,30 90,50 80,60 C70,70 60,60 65,50 C70,40 100,40 120,50 M140,50 C140,50 150,20 170,20 C190,20 180,50 170,60 M200,60 L280,60"
                        fill="transparent"
                        stroke="#78716c" // Stone-500
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{
                            duration: 1.2,
                            ease: "easeInOut",
                        }}
                    />
                    {/* Real Text Overlay Fade In (To ensure readability after trace) */}
                    <motion.text
                        x="50%"
                        y="55%"
                        dominantBaseline="middle"
                        textAnchor="middle"
                        className="font-serif text-3xl fill-[#5C534E]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8, duration: 0.8 }}
                    >
                        gelato pique
                    </motion.text>
                </svg>
            </motion.div>

            {/* Soft Blur Text Reveal with subtle pulse */}
            <motion.div
                initial={{ opacity: 0, filter: "blur(10px)", letterSpacing: "0.2em" }}
                animate={{ opacity: [1, 0.7, 1], filter: "blur(0px)", letterSpacing: "0.05em" }}
                transition={{
                    opacity: {
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1.5
                    },
                    filter: {
                        duration: 1.2,
                        ease: "easeOut",
                        delay: 0.2
                    },
                    letterSpacing: {
                        duration: 1.2,
                        ease: "easeOut",
                        delay: 0.2
                    }
                }}
                className="text-[#A8A29E] font-serif italic text-sm tracking-wide mb-4"
            >
                Loading...
            </motion.div>

            {/* Bouncing Dots - Continuous Animation */}
            <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-[#A8A29E]"
                        animate={{ y: [-6, 0, -6] }}
                        transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 1.5 + i * 0.15
                        }}
                    />
                ))}
            </div>
        </motion.div>
    );
}
