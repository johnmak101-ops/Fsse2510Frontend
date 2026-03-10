/**
 * @file administrative Access Controller
 * @module components/common/AdminGuard
 * 
 * protection wrapper for admin-only routes.
 * verifies user state via AuthStore and provides a high-fidelity loading experience during authorization checks.
 */

"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { motion } from "framer-motion";
import { toast } from "sonner";

/**
 * authorization gateway.
 * ensures only authenticated administrators can access children content.
 * features a cinematic loading sequence to maintain brand continuity during auth-delay.
 */
export default function AdminGuard({ children }: { children: ReactNode }) {
    const { user, isLoading } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        // performs redirect only after confirmation that loading has ceased.
        if (!isLoading) {
            if (!user) {
                router.push("/login");
            } else if (user.role !== 'ADMIN') {
                if (process.env.NODE_ENV === 'development') console.error(`Access Denied: User attempted to access admin route without ADMIN role.`);
                toast.error("Access Denied: Administrator privileges required.");
                router.replace("/");
            }
        }
    }, [user, isLoading, router]);

    // renders a premium motion-enhanced loading state while verifying credentials.
    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-[#FFFCF9] z-9999 flex flex-col items-center justify-center p-6 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative"
                >
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.3, 0.1, 0.3]
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute inset-0 bg-[#88C9C0] rounded-full blur-2xl"
                    />

                    <div className="relative w-20 h-20">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                                repeat: Infinity,
                                duration: 1.2,
                                ease: "linear"
                            }}
                            className="w-full h-full border-4 border-[#88C9C0]/10 border-t-[#88C9C0] rounded-full"
                        />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-8 space-y-2"
                >
                    <h2 className="font-serif text-2xl text-[#5C534E] tracking-tight">Authenticating...</h2>
                    <p className="text-[#9CA3AF] text-sm font-medium uppercase tracking-widest">Entering Admin Workspace</p>
                </motion.div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return <>{children}</>;
}
