/**
 * @file user Password Recovery Page
 * @module app/(auth)/forgot-password/page
 * 
 * facilitates self-service password reset requests via email.
 * implements secure error handling to mitigate account enumeration risks.
 * provides immediate visual feedback and instructional success states.
 */

"use client";

import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import { InputGroup } from "@/components/auth/InputGroup";
import { toast } from "sonner";
import Link from "next/link";

/** 
 * specialized form for lost credential recovery. 
 * coordinates with Firebase Auth to dispatch reset link localized for the user's registered identity.
 */
export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!email) {
            setError("Please enter your email address");
            setLoading(false);
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            setSuccess(true);
            toast.success("Reset link sent! Please check your email.");
        } catch (err: unknown) {
            console.error("Reset Password Error:", err);
            // Firebase security: Don't reveal if user exists easily, but helpful for debug
            const firebaseError = err as { code?: string };
            if (firebaseError.code === 'auth/user-not-found') {
                setError("If this account exists, an email has been sent.");
            } else if (firebaseError.code === 'auth/invalid-email') {
                setError("Invalid email format.");
            } else {
                setError("Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-white p-8">
            <div className="w-full max-w-md space-y-12">
                <div className="space-y-2 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="font-serif text-4xl text-black tracking-tight"
                    >
                        Reset Password
                    </motion.h1>
                    <p className="text-stone-400 text-xs uppercase tracking-widest font-bold">
                        Enter your email to receive a reset link.
                    </p>
                </div>

                {success ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center space-y-6"
                    >
                        <div className="p-6 bg-stone-50 border border-stone-100">
                            <p className="text-stone-600 text-sm font-sans mb-2">Check your inbox!</p>
                            <p className="text-stone-400 text-xs">We have sent a password reset link to <span className="text-black font-bold">{email}</span>.</p>
                        </div>
                        <Link href="/login" className="inline-block text-[10px] uppercase font-bold tracking-[0.2em] text-black border-b border-black hover:opacity-70 transition-opacity pb-1">
                            Back to Sign In
                        </Link>
                    </motion.div>
                ) : (
                    <form onSubmit={handleReset} className="space-y-8">
                        <InputGroup
                            label="Email Address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                        />

                        <motion.button
                            whileHover={!loading ? { backgroundColor: "#333" } : {}}
                            whileTap={!loading ? { scale: 0.99 } : {}}
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-black text-white font-bold tracking-[0.2em] rounded-none transition-all uppercase text-[11px] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                        >
                            {loading ? (
                                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            ) : (
                                "Send Reset Link"
                            )}
                        </motion.button>

                        <div className="text-center">
                            <Link
                                href="/login"
                                className="text-stone-400 text-[10px] font-bold tracking-widest uppercase hover:text-black transition-colors border-b border-transparent hover:border-black pb-0.5"
                            >
                                Back to Sign In
                            </Link>
                        </div>
                    </form>
                )}

                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-8"
                        >
                            <div className="bg-red-50 text-red-500 text-[10px] uppercase tracking-widest font-bold py-3 text-center border border-red-100">
                                {error}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
