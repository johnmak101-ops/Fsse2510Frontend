/**
 * @file Stripe Payment Processing Form
 * @module components/checkout/CheckoutForm
 * 
 * handles secure credit card collection and payment intent confirmation via Stripe.
 * orchestrates synchronous backend verification and stock deduction upon successful capture.
 */

"use client";

import { FormEvent, useState } from "react";
import {
    PaymentElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import { useRouter } from "next/navigation";
import apiClient from "@/services/api-client";
import Button from "@/components/ui/button";
import { Loader2 } from "lucide-react";

/** properties for the CheckoutForm component. */
interface CheckoutFormProps {
    /** unique transaction identity used to finalize order on the server. */
    tid: string;
}

/**
 * secure payment interface.
 * integrates Stripe PaymentElement and manages multi-stage confirmation logic.
 */
export default function CheckoutForm({ tid }: CheckoutFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const router = useRouter();

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    /** executes payment confirmation and subsequent order finalization. */
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);
        setErrorMessage(null);

        try {
            // 1. Confirm Payment with Stripe via the browser-standard redirect or inline flow.
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: window.location.origin,
                },
                redirect: "if_required",
            });

            if (error) {
                setErrorMessage(error.message || "Payment failed");
                setIsProcessing(false);
                return;
            }

            if (paymentIntent && paymentIntent.status === "succeeded") {
                // 2. Notify Backend to Verify Payment & Deduct Inventory.
                // WHY: Stripe capture can take significant time; we extend timeout to ensure data consistency.
                await apiClient.patch(`/transactions/${tid}/success`, undefined, { timeout: 30000 });

                // 3. Navigate to success confirmation.
                router.push(`/checkout/success?tid=${tid}`);
            } else {
                setErrorMessage("Payment status unexpected: " + paymentIntent.status);
            }
        } catch (err) {
            console.error(err);
            setErrorMessage(
                "Payment successful, but finalizing order failed. Please contact support."
            );
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />

            {errorMessage && (
                <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                    {errorMessage}
                </div>
            )}

            <Button
                type="submit"
                disabled={!stripe || isProcessing}
                className="w-full py-6 bg-black text-white hover:bg-stone-800 rounded-none uppercase tracking-[0.4em] text-[10px] font-bold transition-all shadow-lg shadow-black/10"
            >
                {isProcessing ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                    </>
                ) : (
                    "Pay Now"
                )}
            </Button>
        </form>
    );
}
