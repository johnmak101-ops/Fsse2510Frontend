/**
 * @file Authentication / Login Page
 * @module app/(auth)/login/page
 * 
 * facilitates secure user entry into the Gelato Pique commerce platform.
 * implements a split-screen design with brand-aligned animations and a focused login form.
 * coordinates Firebase authentication with backend user synchronization via server actions.
 */

"use client";

import React, { useState } from "react";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { syncUserAction } from "./actions";
import { getFriendlyErrorMessage } from "@/lib/error-utils";

import { motion, AnimatePresence } from "framer-motion";
import { InputGroup } from "@/components/auth/InputGroup";
import { SocialLoginButton } from "@/components/auth/SocialLoginButton";
import { Suspense } from "react";

const googleProvider = new GoogleAuthProvider();

/** 
 * main entry for authentication flows. 
 * utilizes `LoginFormContent` wrapped in a brand-aligned loading boundary to manage interactive session establishment.
 */
export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-8 h-8 border-2 border-stone-200 border-t-stone-800 rounded-full animate-spin" />
            </div>
        }>
            <LoginFormContent />
        </Suspense>
    );
}

// --- Animated Text Component ---
const MarqueeText = () => (
    <div className="flex flex-col gap-8 opacity-20 select-none pointer-events-none">
        {[...Array(6)].map((_, i) => (
            <div key={i} className="flex gap-8 animate-marquee whitespace-nowrap text-[8vw] font-black tracking-tighter text-transparent stroke-text" style={{
                animationDuration: `${30 + i * 5}s`,
                animationDirection: i % 2 === 0 ? 'normal' : 'reverse',
                WebkitTextStroke: '2px white'
            }}>
                <span>GELATO PIQUE</span>
                <span>GELATO PIQUE</span>
                <span>GELATO PIQUE</span>
                <span>GELATO PIQUE</span>
            </div>
        ))}
    </div>
);

function LoginFormContent() {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState("");

    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get("redirect") || "/";

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError("");
    };

    const syncUserWithBackend = async () => {
        const user = auth.currentUser;
        if (!user) return;

        try {
            const token = await user.getIdToken();
            const result = await syncUserAction(token);

            if (!result.success) {
                console.error("Backend Sync Failed:", result.error);
            }
        } catch (err) {
            console.error("Token Retrieval Failed:", err);
        }
    };




    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!email || !password) {
            setError("Please fill in all fields");
            setLoading(false);
            return;
        }

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }

            await syncUserWithBackend();

            router.push(redirectTo);
        } catch (err: unknown) {
            console.error("Auth Error:", err);
            setError(getFriendlyErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError("");
        try {
            // Switch to Popup Flow
            const result = await signInWithPopup(auth, googleProvider);
            if (result.user) {
                await syncUserWithBackend();
                router.push(redirectTo);
            }
        } catch (err: unknown) {
            console.error("Google Auth Request Error:", err);
            setError(getFriendlyErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row">

            {/* --- Left Side: Animated Sidebar (Hidden on Mobile) --- */}
            <div className="hidden lg:flex w-1/2 bg-black relative flex-col justify-center overflow-hidden">
                <div className="absolute inset-0 bg-stone-900/50 z-10" />
                <div className="absolute inset-0 flex flex-col justify-center rotate-[-15deg] scale-150">
                    <MarqueeText />
                </div>
            </div>

            {/* --- Right Side: Form Container --- */}
            <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8 lg:p-24 relative min-h-screen lg:min-h-auto">

                <div className="w-full max-w-md space-y-12">
                    <Link href="/" className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-[0.2em] text-stone-400 hover:text-black transition-colors group">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-x-1"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
                        Back to Home
                    </Link>

                    <div className="space-y-2">
                        <motion.h1
                            key={isLogin ? "login" : "register"}

                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="font-serif text-4xl text-black tracking-tight"
                        >
                            {isLogin ? "Welcome Back" : "Create Account"}
                        </motion.h1>
                        <p className="text-stone-400 text-xs uppercase tracking-widest font-bold">
                            {isLogin ? "Please enter your details." : "Join our community today."}
                        </p>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-8">
                        <div className="space-y-6">
                            <InputGroup
                                label="Email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                            />
                            <InputGroup
                                label="Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        {/* Remember Me & Forgot Password Row */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className={`w-4 h-4 border transition-colors flex items-center justify-center ${rememberMe ? 'bg-black border-black' : 'border-stone-300 group-hover:border-black'}`}>
                                    {rememberMe && <div className="w-2 h-2 bg-white" />}
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-stone-400 group-hover:text-black transition-colors">Remember me</span>
                            </label>

                            <Link href="/forgot-password" className="text-[10px] uppercase font-bold tracking-[0.2em] text-stone-300 hover:text-black transition-colors border-b border-transparent hover:border-black pb-0.5">
                                Reset password
                            </Link>
                        </div>

                        <div className="space-y-4">
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
                                    isLogin ? "Sign in" : "Sign up"
                                )}
                            </motion.button>

                            <SocialLoginButton
                                onClick={handleGoogleSignIn}
                                disabled={loading}
                                provider="google"
                            />
                        </div>
                    </form>

                    <div className="text-center">
                        <span className="text-stone-400 text-[10px] font-bold tracking-widest uppercase">
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                        </span>
                        <button
                            onClick={toggleMode}
                            disabled={loading}
                            className="text-black text-[10px] font-bold tracking-widest uppercase hover:text-stone-600 transition-colors border-b border-black hover:border-stone-600 pb-0.5 ml-1 disabled:opacity-50"
                        >
                            {isLogin ? "Sign up" : "Log in"}
                        </button>
                    </div>
                </div>

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