/**
 * @file Authentication / Registration Page
 * @module app/(auth)/register/page
 * 
 * orchestrates new user onboarding via email/password or Google federated identity.
 * implements a brand-aligned cozy aesthetic with smooth layout transitions.
 * handles redirect-based authentication flow for social providers.
 */

"use client";

import React, { useState, useEffect, FormEvent } from "react";
import {
    createUserWithEmailAndPassword,
    signInWithRedirect,
    getRedirectResult,
    GoogleAuthProvider
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { RiGoogleFill, RiMailLine, RiLockLine, RiHomeLine } from "@remixicon/react";
import Link from "next/link";

const googleProvider = new GoogleAuthProvider();

/** 
 * main entry for creating user accounts. 
 * manages interactive form state and coordinates with Firebase Auth for identity creation.
 */
export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Handle Redirect Result (For Google Login)
    useEffect(() => {
        const checkRedirect = async () => {
            try {
                const result = await getRedirectResult(auth);
                if (result) {
                    setLoading(true);
                    // For registration via Google, we just treat it as login success
                    // The backend sync usually happens in a layover or centrally, 
                    // but here we just redirect home.
                    router.push("/");
                }
            } catch (err: unknown) {
                console.error("Google Redirect Error:", err);
                setError(err instanceof Error ? err.message : "An unknown error occurred");
            } finally {
                setLoading(false);
            }
        };

        void checkRedirect();
    }, [router]);

    const handleRegister = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            router.push("/");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "An unknown error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        try {
            await signInWithRedirect(auth, googleProvider);
            // Execution stops here
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "An unknown error occurred");
            setLoading(false);
        }
    };


    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="bg-white p-8 md:p-12 rounded-4xl shadow-[0_10px_40px_rgba(233,213,205,0.3)] border border-[#F5E6E0] relative"
            >
                <div className="text-center mb-10">
                    <h1 className="font-serif text-3xl text-[#8B7E74] mb-2 tracking-tight">
                        Create Account
                    </h1>
                    <p className="text-[#A79C93] text-sm tracking-wide uppercase font-bold px-4">
                        Join our cozy community
                    </p>
                </div>

                <form onSubmit={handleRegister} className="space-y-6">
                    <div className="space-y-4">
                        <div className="relative">
                            <RiMailLine className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D1C7C1]" size={20} />
                            <input
                                type="email"
                                placeholder="Email Address"
                                className="w-full pl-12 pr-4 py-4 bg-[#FDF8F5] border border-[#F5E6E0] rounded-2xl outline-none focus:ring-2 focus:ring-[#E9D5CD] transition-all text-[#8B7E74] placeholder:text-[#D1C7C1]"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="relative">
                            <RiLockLine className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D1C7C1]" size={20} />
                            <input
                                type="password"
                                placeholder="Password"
                                className="w-full pl-12 pr-4 py-4 bg-[#FDF8F5] border border-[#F5E6E0] rounded-2xl outline-none focus:ring-2 focus:ring-[#E9D5CD] transition-all text-[#8B7E74] placeholder:text-[#D1C7C1]"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-red-400 text-xs text-center"
                        >
                            {error}
                        </motion.p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-[#E9D5CD] hover:bg-[#DBC3B9] text-white font-bold tracking-[0.2em] rounded-2xl transition-all shadow-lg shadow-[#E9D5CD]/20 uppercase text-xs disabled:opacity-50"
                    >
                        {loading ? "Processing..." : "Register"}
                    </button>
                </form>

                <div className="relative my-10 text-center">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[#F5E6E0]"></div>
                    </div>
                    <span className="relative px-4 bg-white text-[#D1C7C1] text-[10px] font-bold tracking-widest uppercase">Or continue with</span>
                </div>

                <button
                    onClick={handleGoogleSignIn}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-white border border-[#F5E6E0] text-[#8B7E74] font-bold tracking-widest rounded-2xl hover:bg-[#FDF8F5] transition-all text-xs uppercase"
                >
                    <RiGoogleFill size={18} className="text-[#8B7E74]" />
                    Sign in with Google
                </button>

                <div className="mt-8 text-center flex flex-col gap-4 items-center">
                    <Link
                        href="/login"
                        className="text-[#A79C93] text-xs font-bold tracking-widest uppercase hover:text-[#8B7E74] transition-colors"
                    >
                        Already have an account? Login
                    </Link>

                    <Link
                        href="/"
                        className="text-[#D1C7C1] hover:text-[#8B7E74] transition-colors duration-300 flex items-center gap-1.5 group"
                    >
                        <RiHomeLine size={14} className="text-[#D1C7C1] group-hover:text-[#8B7E74] transition-colors" />
                        <span className="text-[10px] uppercase font-bold tracking-widest">Back to Home</span>
                    </Link>
                </div>
            </motion.div>

            {/* Soft Loading Overlay */}
            <AnimatePresence>
                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-white/60 backdrop-blur-sm z-100 flex items-center justify-center"
                    >
                        <motion.div
                            animate={{
                                scale: [1, 1.1, 1],
                                opacity: [0.5, 1, 0.5]
                            }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="w-16 h-16 bg-[#E9D5CD] rounded-full"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
