import { useRouter } from "next/router";
import { useVerifyPayment } from "@/hooks/subscriptionHooks/useVerify-payment";
import { useEffect } from "react";

const VerifyPaymentPage = () => {
    const router = useRouter();
    const { reference } = router.query;
    if (typeof reference !== "string") {
        return (
            <div className="flex items-center justify-center h-screen">
                <h1 className="text-2xl font-bold">Invalid payment reference.</h1>
            </div>
        );
    }
    const verifyPaymentMutation = useVerifyPayment();

    useEffect(() => {
        if (reference) {
            verifyPaymentMutation.mutate(reference);
        }
    }, [reference]);
    return (
        <div className="flex items-center justify-center h-screen">
            <h1 className="text-2xl font-bold">Verifying your payment...</h1>
        </div>
    )
}