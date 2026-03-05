/**
 * @file Payment gateway Orchestration
 * @module components/checkout/PaymentWrapper
 * 
 * bootstraps the payment session by fetching payment intents or redirect URLs from the server.
 * handles "already paid" scenarios to prevent double-charging and manages direct Stripe redirects.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/services/api-client";
import { Loader2 } from "lucide-react";

/** properties for the PaymentWrapper component. */
interface PaymentWrapperProps {
    /** current transaction identity to fetch payment details for. */
    tid: number | string;
}

/** server response schema for payment initialization. */
interface PaymentResponse {
    /** secure token for Stripe elements. */
    client_secret: string;
    /** transaction reference. */
    tid: number;
    /** total amount in cents. */
    amount: number;
    /** external hosted payment URL if applicable. */
    url: string;
}

/**
 * silent payment initializer.
 * displays a loading state while negotiating with the payment provider.
 */
export default function PaymentWrapper({ tid }: PaymentWrapperProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        /** initiates payment negotiation with the secure backend gateway. */
        const fetchPaymentIntent = async () => {
            try {
                const data = await apiClient.post<PaymentResponse>(
                    `/transactions/${tid}/payment`
                );

                // handles case where transaction was already finalized via another session/webhook.
                if (data.client_secret === "ALREADY_PAID") {
                    router.push(`/checkout/success/${tid}`);
                    return;
                }

                // handles redirection to hosted payment pages (e.g., Stripe Checkout).
                if (data.url) {
                    window.location.href = data.url;
                    return;
                }
            } catch (err) {
                console.error(err);
                setError("Failed to initialize payment. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        if (tid) {
            void fetchPaymentIntent();
        }
    }, [tid, router]);

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-red-500 bg-red-50 rounded-md text-center">
                {error}
            </div>
        );
    }

    if (!isLoading) {
        return null;
    }

    return (
        <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Redirecting to Stripe...</span>
        </div>
    );
}
