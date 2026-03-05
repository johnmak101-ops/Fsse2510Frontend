/**
 * @file cinematical Cart Loading sequencer
 * @module features/cart/components/cart/CartLoadingState
 * 
 * specialized loading experience for the cart feature.
 * orchestrates a multi-stage transition:
 * 1. Introduction: Elegant SVG Logo Trace and Blur Reveal (~1.8s).
 * 2. Transition: Cross-fade to the structural CartSkeleton.
 */

"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CartSkeleton from "./CartSkeleton";

/**
 * state-driven loading UI.
 * manages the timing of the brand intro sequence before handing off to the skeleton loader.
 */
export default function CartLoadingState() {
    const [stage, setStage] = useState<"intro" | "skeleton">("intro");

    useEffect(() => {
        // Run the intro sequence for exactly 2 seconds, then switch to skeleton
        const timer = setTimeout(() => {
            setStage("skeleton");
        }, 1800);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="w-full min-h-[80vh]">
            <AnimatePresence mode="wait">
                {stage === "intro" ? (
                    <motion.div
                        key="intro-logo"
                        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white"
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                    >
                        {/* 1. Elegant Logo Trace Animation */}
                        <div className="relative w-64 h-24 mb-6 flex items-center justify-center">
                            <svg viewBox="0 0 300 100" className="w-full h-full">
                                {/* Simulated "Gelato Pique" Cursive Path - Abstract Elegant Curves */}
                                {/* This path simulates a signature-like G and P flow */}
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
                        </div>

                        {/* 2. Soft Blur Text Reveal */}
                        <motion.div
                            initial={{ opacity: 0, filter: "blur(10px)", letterSpacing: "0.2em" }}
                            animate={{ opacity: 1, filter: "blur(0px)", letterSpacing: "0.05em" }}
                            transition={{
                                duration: 1.2,
                                ease: "easeOut",
                                delay: 0.2 // Start slightly after logo starts
                            }}
                            className="text-[#A8A29E] font-serif italic text-sm tracking-wide"
                        >
                            Loading From Gelato Pique
                        </motion.div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="skeleton"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <CartSkeleton />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
