"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createLiabilitySchema, CreateLiabilityInput } from "@/schemas/liabilities.schema";
import { useCreateLiability } from "@/hooks/liabilitiesHooks/useCreateLiability";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createLiability } from "@/offline/finance/liabilities/createLiability.service";

interface Props {
  mode?: "OPENING" | "LIVE";
  onComplete?: () => void;
}

export const CreateLiabilityForm = ({ mode, onComplete }: Props) => {
  const { mutate, isPending } = useCreateLiability();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateLiabilityInput>({
    resolver: zodResolver(createLiabilitySchema) as any,
    defaultValues: {
      interestRate: 0,
      startDate: new Date(),
    },
  });

  const onSubmit = (data: CreateLiabilityInput) => {
    const payload: CreateLiabilityInput = {
        ...data,
        startDate: data.startDate ? new Date(data.startDate).toISOString() : undefined,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined
    }
    createLiability(payload)
  };

  return (
    <Card className="max-w-md w-full mx-auto p-6 space-y-6 shadow-lg rounded-2xl bg-white">
      <h2 className="text-lg font-semibold text-gray-800 text-center">
        {mode === "OPENING" ? "Add Opening Liability" : "New Liability"}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Title */}
        <div className="flex flex-col">
          <input
            {...register("title")}
            placeholder="Loan Title"
            className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-400 focus:outline-none text-gray-700"
          />
          {errors.title && (
            <span className="text-red-500 text-sm mt-1">{errors.title.message}</span>
          )}
        </div>

        {/* Type */}
        <div className="flex flex-col">
          <input
            {...register("type")}
            placeholder="Loan Type"
            className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-400 focus:outline-none text-gray-700"
          />
          {errors.type && (
            <span className="text-red-500 text-sm mt-1">{errors.type.message}</span>
          )}
        </div>

        {/* Principal & Interest */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <input
              type="number"
              step="0.01"
              {...register("principalAmount", { valueAsNumber: true })}
              placeholder="Principal Amount"
              className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-400 focus:outline-none text-gray-700"
            />
            {errors.principalAmount && (
              <span className="text-red-500 text-sm mt-1">{errors.principalAmount.message}</span>
            )}
          </div>

          <div className="flex flex-col">
            <input
              type="number"
              step="0.01"
              {...register("interestRate", { valueAsNumber: true })}
              placeholder="Interest Rate (%)"
              className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-400 focus:outline-none text-gray-700"
            />
            {errors.interestRate && (
              <span className="text-red-500 text-sm mt-1">{errors.interestRate.message}</span>
            )}
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <input
              type="date"
              {...register("startDate")}
              className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-400 focus:outline-none text-gray-700"
            />
            {errors.startDate && (
              <span className="text-red-500 text-sm mt-1">{errors.startDate.message}</span>
            )}
          </div>

          <div className="flex flex-col">
            <input
              type="date"
              {...register("dueDate")}
              className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-400 focus:outline-none text-gray-700"
            />
            {errors.dueDate && (
              <span className="text-red-500 text-sm mt-1">{errors.dueDate.message}</span>
            )}
          </div>
        </div>

        <Button type="submit" disabled={isPending} fullWidth>
          {isPending ? "Saving..." : "Create Liability"}
        </Button>
      </form>
    </Card>
  );
};