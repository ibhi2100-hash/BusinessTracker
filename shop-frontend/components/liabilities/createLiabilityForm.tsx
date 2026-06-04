"use client";

import { useState } from "react";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Landmark,
  Calendar,
  Percent,
  Wallet,
  FileText,
  Loader2,
} from "lucide-react";

import {
  createLiabilitySchema,
  CreateLiabilityInput,
} from "@/schemas/liabilities.schema";

import { eventService } from "@/src/services/eventService";
import { OpeningEventType } from "@/offline/core/events/eventGroups/openingEvents";
import { financeEventType } from "@/offline/core/events/eventGroups/financeEvent";
import { AggregateType } from "@/offline/domain/aggregate";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";

interface Props {
  mode?: "OPENING" | "LIVE";
  onComplete?: () => void;
}

export function CreateLiabilityForm({
  mode = "LIVE",
  onComplete,
}: Props) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateLiabilityInput>({
    resolver: zodResolver(createLiabilitySchema),
    defaultValues: {
      interestRate: 0,
      startDate: new Date().toISOString().split("T")[0] as any,
    },
  });

  const onSubmit = async (
    data: CreateLiabilityInput
  ) => {
    try {
      setLoading(true);

      await eventService.create({
        aggregateType: AggregateType.LIABILITY,
        aggregateId: nanoid(),

        type:
          mode === "OPENING"
            ? OpeningEventType.OPENING_LIABILITIES
            : financeEventType.LIABILITY_ADDED,

        payload: {
          ...data,
          type:
            mode === "OPENING"
              ? "OPENING"
              : "LIVE",
        },

        mode,
      });

      toast.success(
        "Liability created successfully"
      );

      reset();

      onComplete?.();
    } catch (error: any) {
      console.error(error);

      toast.error(
        error?.message ??
          "Failed to create liability"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard className="p-6 space-y-6">

      <div>
        <h2 className="text-xl font-semibold">
          {mode === "OPENING"
            ? "Opening Liability"
            : "Add Liability"}
        </h2>

        <p className="text-sm text-gray-400 mt-1">
          Track loans, debts and obligations.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <GlassInput
          icon={<FileText size={18} />}
          placeholder="Loan title"
          {...register("title")}
        />

        {errors.title && (
          <p className="text-red-400 text-sm">
            {errors.title.message}
          </p>
        )}

        <GlassInput
          icon={<Landmark size={18} />}
          placeholder="Loan type"
          {...register("type")}
        />

        <div className="grid md:grid-cols-2 gap-4">
          <GlassInput
            type="number"
            icon={<Wallet size={18} />}
            placeholder="Principal amount"
            {...register(
              "principalAmount",
              {
                valueAsNumber: true,
              }
            )}
          />

          <GlassInput
            type="number"
            icon={<Percent size={18} />}
            placeholder="Interest rate"
            {...register(
              "interestRate",
              {
                valueAsNumber: true,
              }
            )}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <GlassInput
            type="date"
            icon={<Calendar size={18} />}
            {...register("startDate")}
          />

          <GlassInput
            type="date"
            icon={<Calendar size={18} />}
            {...register("dueDate")}
          />
        </div>

        <GlassButton
          type="submit"
          disabled={loading}
          className="w-full"
        >
          {loading && (
            <Loader2
              size={16}
              className="animate-spin"
            />
          )}

          {loading
            ? "Creating Liability..."
            : "Create Liability"}
        </GlassButton>
      </form>
    </GlassCard>
  );
}