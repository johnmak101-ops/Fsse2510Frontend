/**
 * @file global 404 Not Found response
 * @module app/not-found
 * 
 * rendered when navigations resolve to non-existent dynamic or static routes.
 */

import Link from "next/link";

/** global 404 user interface. */
export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
            <div className="text-center max-w-md">
                <p className="text-stone-300 font-serif text-8xl font-bold mb-4">
                    404
                </p>
                <h1 className="font-serif text-2xl text-stone-900 mb-3">
                    Page Not Found
                </h1>
                <p className="text-stone-500 text-sm mb-8 leading-relaxed">
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </p>
                <Link
                    href="/"
                    className="inline-block px-8 py-2.5 bg-stone-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-colors"
                >
                    Back to Home
                </Link>
            </div>
        </div>
    );
}
