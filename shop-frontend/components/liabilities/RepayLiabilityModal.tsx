"use client";

import { useForm } from "react-hook-form";
import { useRepayLiability } from "@/hooks/liabilitiesHooks/useRepayLiability";
import { repayLiabilitySchema, RepayLiabilityInput } from "@/schemas/repayliability.schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";

interface Props {
  liabilityId: string;
  onClose: () => void;
}

export const RepayLiabilityModal = ({ liabilityId, onClose }: Props) => {
  const qc = useQueryClient();

  const { mutate, isPending } = useRepayLiability();
  const { register, handleSubmit } = useForm<RepayLiabilityInput>({
    resolver: zodResolver(repayLiabilitySchema) as any,
    defaultValues: {
      amount: 0,
      paymentDate: new Date()
    },
  });

  const onSubmit = (data : RepayLiabilityInput) => {
    const dataPayload: RepayLiabilityInput = {
      ...data.payload,
      paymentDate: data.paymentDate ? new Date(data.paymentDate).toISOString() : undefined,
    }
    mutate({ liabilityId, dataPayload  },
       { onSuccess: onClose });
  };

  return (
    <Card className="max-w-sm w-full mx-auto p-6 space-y-6 shadow-lg rounded-2xl bg-white">
      <h2 className="text-lg font-semibold text-gray-800 text-center">
        Repay Liability
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input
          type="number"
          step="0.01"
          {...register("amount", { valueAsNumber: true })}
          placeholder="Enter Amount"
          className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-400 focus:outline-none text-gray-700"
        />
        <input
          type="date"
          {...register("paymentDate")}
          className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-400 focus:outline-none text-gray-700"
        />

        <div className="flex justify-between gap-2">
          <Button
            variant="secondary"
            type="button"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={isPending}
          >
            {isPending ? "Processing..." : "Repay"}
          </Button>
        </div>
      </form>
    </Card>
  );
};