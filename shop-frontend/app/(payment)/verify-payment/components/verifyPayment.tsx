"use client";

import { useEffect } from "react";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Receipt,
  ArrowRight,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

import { useVerifyPayment } from "@/hooks/subscriptionHooks/useVerify-payment";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassIcon } from "@/components/ui/GlassIcon";

const VerifyPaymentPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const reference =
    searchParams.get("reference");

  const verifyPayment =
    useVerifyPayment();

  useEffect(() => {
    if (!reference) return;

    verifyPayment.mutate(reference);
  }, [reference]);

  useEffect(() => {
    if (verifyPayment.isSuccess) {
      const timer = setTimeout(() => {
        router.replace("/dashboard");
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [verifyPayment.isSuccess]);

  // ------------------------------------------------
  // INVALID REFERENCE
  // ------------------------------------------------

  if (!reference) {
    return (
      <div
        className="
        min-h-screen
        flex
        items-center
        justify-center
        p-4
        "
      >
        <GlassCard
          variant="accent"
          className="
            w-full
            max-w-md
            p-8
            text-center
          "
        >
          <div className="flex justify-center">
            <GlassIcon variant="danger">
              <XCircle size={28} />
            </GlassIcon>
          </div>

          <h1
            className="
            mt-5
            text-2xl
            font-bold
            "
          >
            Invalid Payment Link
          </h1>

          <p
            className="
            mt-3
            text-gray-400
            "
          >
            The payment reference could
            not be found.
          </p>

          <GlassButton
            className="w-full mt-6"
            onClick={() =>
              router.push("/pricing")
            }
          >
            Back To Pricing
          </GlassButton>
        </GlassCard>
      </div>
    );
  }

  // ------------------------------------------------
  // VERIFYING
  // ------------------------------------------------

  if (verifyPayment.isPending) {
    return (
      <div
        className="
        min-h-screen
        flex
        items-center
        justify-center
        p-4
        "
      >
        <GlassCard
          variant="accent"
          className="
            w-full
            max-w-md
            p-8
            text-center
          "
        >
          <div className="flex justify-center">
            <GlassIcon>
              <Loader2
                size={28}
                className="animate-spin"
              />
            </GlassIcon>
          </div>

          <h1
            className="
            mt-5
            text-2xl
            font-bold
            "
          >
            Verifying Payment
          </h1>

          <p
            className="
            mt-3
            text-gray-400
            "
          >
            Please wait while we confirm
            your subscription payment.
          </p>

          <div
            className="
            mt-6
            rounded-2xl
            border
            border-white/10
            bg-white/5
            p-4
            "
          >
            <div className="flex items-center gap-3">
              <Receipt size={18} />

              <span
                className="
                text-sm
                text-gray-300
                truncate
                "
              >
                {reference}
              </span>
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  // ------------------------------------------------
  // SUCCESS
  // ------------------------------------------------

  if (verifyPayment.isSuccess) {
    return (
      <div
        className="
        min-h-screen
        flex
        items-center
        justify-center
        p-4
        "
      >
        <GlassCard
          variant="accent"
          className="
            w-full
            max-w-md
            p-8
            text-center
          "
        >
          <div className="flex justify-center">
            <GlassIcon variant="success">
              <CheckCircle2 size={30} />
            </GlassIcon>
          </div>

          <h1
            className="
            mt-5
            text-2xl
            font-bold
            "
          >
            Payment Verified
          </h1>

          <p
            className="
            mt-3
            text-gray-400
            "
          >
            Your subscription has been
            activated successfully.
          </p>

          <div
            className="
            mt-5
            text-sm
            text-emerald-400
            "
          >
            Redirecting to dashboard...
          </div>

          <GlassButton
            className="w-full mt-6"
            onClick={() =>
              router.replace("/dashboard")
            }
            icon={<ArrowRight size={18} />}
          >
            Continue
          </GlassButton>
        </GlassCard>
      </div>
    );
  }

  // ------------------------------------------------
  // ERROR
  // ------------------------------------------------

  return (
    <div
      className="
      min-h-screen
      flex
      items-center
      justify-center
      p-4
      "
    >
      <GlassCard
        variant="accent"
        className="
          w-full
          max-w-md
          p-8
          text-center
        "
      >
        <div className="flex justify-center">
          <GlassIcon variant="danger">
            <XCircle size={28} />
          </GlassIcon>
        </div>

        <h1
          className="
          mt-5
          text-2xl
          font-bold
          "
        >
          Verification Failed
        </h1>

        <p
          className="
          mt-3
          text-gray-400
          "
        >
          We couldn't verify your
          payment. Please try again or
          contact support.
        </p>

        <GlassButton
          variant="danger"
          className="w-full mt-6"
          onClick={() =>
            router.push("/pricing")
          }
        >
          Try Again
        </GlassButton>
      </GlassCard>
    </div>
  );
};

export default VerifyPaymentPage;