/**
 * @file global runtime Error Boundary
 * @module app/error
 * 
 * catches unexpected runtime exceptions across the application and presents a curated recovery interface.
 * Next.js automatically injects this component into the root layout's error reporting flow.
 */

"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * primary error boundary component.
 * handles automated logging and provides manual retry/home navigational hooks.
 */
export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("[GlobalError]", error);
    }, [error]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
            <div className="text-center max-w-md">
                <h1 className="font-serif text-4xl text-stone-900 mb-4">
                    Something went wrong
                </h1>
                <p className="text-stone-500 text-sm mb-8 leading-relaxed">
                    We encountered an unexpected error. Please try again, or return to the homepage.
                </p>
                <div className="flex gap-4 justify-center">
                    <button
                        onClick={reset}
                        className="px-6 py-2.5 bg-stone-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-colors"
                    >
                        Try Again
                    </button>
                    <Link
                        href="/"
                        className="px-6 py-2.5 border border-stone-300 text-stone-700 text-xs font-bold uppercase tracking-widest hover:bg-stone-50 transition-colors"
                    >
                        Go Home
                    </Link>
                </div>
                {process.env.NODE_ENV === "development" && error.message && (
                    <pre className="mt-8 p-4 bg-stone-50 border border-stone-200 rounded text-left text-xs text-stone-600 overflow-auto max-h-40">
                        {error.message}
                    </pre>
                )}
            </div>
        </div>
    );
}
