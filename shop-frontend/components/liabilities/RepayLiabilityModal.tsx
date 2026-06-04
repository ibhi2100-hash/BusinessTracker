"use client";

import { useState } from "react";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import { Loader2, Wallet, Calendar, X } from "lucide-react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  repayLiabilitySchema,
  RepayLiabilityInput,
} from "@/schemas/repayliability.schema";

import { eventService } from "@/src/services/eventService";
import { financeEventType } from "@/offline/core/events/eventGroups/financeEvent";
import { AggregateType } from "@/offline/domain/aggregate";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { GlassIcon } from "@/components/ui/GlassIcon";

interface Props {
  liabilityId: string;
  onClose: () => void;
}

export function RepayLiabilityModal({
  liabilityId,
  onClose,
}: Props) {
  const [pending, setPending] =
    useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RepayLiabilityInput>({
    resolver: zodResolver(
      repayLiabilitySchema
    ),

    defaultValues: {
      amount: 0,

      paymentDate:
        new Date()
          .toISOString()
          .split("T")[0] as any,
    },
  });

  const onSubmit = async (
    data: RepayLiabilityInput
  ) => {
    try {
      setPending(true);

      await eventService.create({
        aggregateType:
          AggregateType.LIABILITY,

        aggregateId: liabilityId,

        type:
          financeEventType.LIABILITY_REPAID,

        mode: "LIVE",

        payload: {
          amount: data.amount,

          paymentDate:
            data.paymentDate
              ? new Date(
                  data.paymentDate
                )
              : new Date(),
        },
      });

      toast.success(
        "Liability repayment recorded"
      );

      reset();

      onClose();
    } catch (error: any) {
      console.error(error);

      toast.error(
        error?.message ??
          "Failed to record repayment"
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <div
      className="
      fixed
      inset-0
      z-50
      flex
      items-center
      justify-center
      bg-black/60
      backdrop-blur-md
      p-4
    "
    >
      <GlassCard
        variant="elevated"
        className="
          w-full
          max-w-md
          p-6
          space-y-6
        "
      >
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GlassIcon variant="success">
              <Wallet size={20} />
            </GlassIcon>

            <div>
              <h2 className="font-semibold">
                Repay Liability
              </h2>

              <p className="text-xs text-gray-400">
                Record a repayment.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="
              text-gray-400
              hover:text-white
              transition-colors
            "
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div>
            <GlassInput
              type="number"
              step="0.01"
              placeholder="Amount"
              icon={<Wallet size={18} />}
              {...register("amount", {
                valueAsNumber: true,
              })}
            />

            {errors.amount && (
              <p className="mt-1 text-sm text-red-400">
                {errors.amount.message}
              </p>
            )}
          </div>

          <div>
            <GlassInput
              type="date"
              icon={<Calendar size={18} />}
              {...register(
                "paymentDate"
              )}
            />

            {errors.paymentDate && (
              <p className="mt-1 text-sm text-red-400">
                {
                  errors.paymentDate
                    .message
                }
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <GlassButton
              type="button"
              variant="tertiary"
              onClick={onClose}
            >
              Cancel
            </GlassButton>

            <GlassButton
              type="submit"
              disabled={pending}
              variant="success"
            >
              {pending && (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              )}

              {pending
                ? "Processing..."
                : "Repay"}
            </GlassButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}