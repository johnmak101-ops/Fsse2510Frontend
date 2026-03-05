/**
 * @file global client-side Providers
 * @module app/providers
 * 
 * orchestrates the global client-side state providers, including TanStack Query, Nuqs, and Sonner notifications.
 * handles isomorphic QueryClient instantiation to prevent memory leaks in SSR.
 */

'use client';

import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { ReactNode } from "react";

/**
 * factory function for creating a pre-configured QueryClient.
 * defines global staleTime and retry policies to optimize storefront performance.
 */
function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                // WHY: set staleTime above 0 to prevent immediate client-side refetching of SSR'd data.
                staleTime: 60 * 1000,
            },
        },
    });
}

/** persistent singleton for browser-side query state. */
let browserQueryClient: QueryClient | undefined = undefined;

/**
 * resolves the active QueryClient instance.
 * ensures a new client is generated per request on the server, while maintaining a singleton on the client.
 */
function getQueryClient() {
    if (typeof window === 'undefined') {
        return makeQueryClient();
    } else {
        // WHY: reuse the existing client in the browser to maintain cache across re-renders and suspensions.
        if (!browserQueryClient) browserQueryClient = makeQueryClient();
        return browserQueryClient;
    }
}

/**
 * root client provider component.
 * provides infrastructure for data fetching, URL state management, and toast notifications.
 */
export default function Providers({ children }: { children: ReactNode }) {
    const queryClient = getQueryClient();


    return (
        <QueryClientProvider client={queryClient}>
            <NuqsAdapter>
                {children}
            </NuqsAdapter>
            <ReactQueryDevtools initialIsOpen={false} />
            <Toaster
                position="top-center"
                richColors
                expand={false}
                toastOptions={{
                    style: {
                        borderRadius: '0px',
                        border: '1px solid #e7e5e4',
                        backgroundColor: '#fff',
                        color: '#1c1917',
                        fontFamily: 'var(--font-inter)',
                        fontSize: '11px',
                        fontWeight: '600',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        padding: '16px 24px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    },
                }}
            />
        </QueryClientProvider>
    );
}
