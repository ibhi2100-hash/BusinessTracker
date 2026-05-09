"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useVerifyPayment } from "@/hooks/subscriptionHooks/useVerify-payment";
import { useEffect } from "react";

const VerifyPaymentPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const reference = searchParams.get("reference");

    const verifyPaymentMutation = useVerifyPayment();

    useEffect(() => {
        if (reference) {
            verifyPaymentMutation.mutate(reference);
        }
    }, [reference]);

    if (!reference) {
        return (
            <div className="flex items-center justify-center h-screen">
                <h1 className="text-2xl font-bold">
                    Invalid payment reference.
                </h1>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center h-screen">
            <h1 className="text-2xl font-bold">
                Verifying your payment...
            </h1>
        </div>
    );
};

export default VerifyPaymentPage;