import { Suspense } from "react";
import VerifyPaymentClient from "./components/verifyPayment";

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyPaymentClient />
        </Suspense>
    );
}