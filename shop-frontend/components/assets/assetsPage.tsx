"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner";

import {
  Landmark,
  Package,
  Calendar,
  Coins,
  Calculator,
  TrendingDown,
} from "lucide-react";

import {
  createAssetSchema,
  CreateAssetInput,
} from "@/schemas/asset.schema";

import { useDepreciationPreview } from "@/hooks/liveDepreciation";
import { formatCurrency } from "@/lib/format";

import { eventService } from "@/src/services/eventService";
import { OpeningEventType } from "@/offline/core/events/eventGroups/openingEvents";
import { financeEventType } from "@/offline/core/events/eventGroups/financeEvent";
import { nanoid } from "nanoid";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassInput } from "@/components/ui/GlassInput";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassIcon } from "@/components/ui/GlassIcon";
import { PageHeader } from "@/components/ui/PageHeader";

interface AssetsProps {
  mode: "OPENING" | "LIVE";
  onCompleted?: () => Promise<void> | void;
}

export default function AddAssetPage({
  mode,
  onCompleted,
}: AssetsProps) {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const {
    register,
    watch,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateAssetInput>({
    resolver:
      zodResolver(createAssetSchema) as any,

    defaultValues: {
      quantity: 1,
      assetType:
        mode === "OPENING"
          ? "OPENING"
          : "PURCHASE",
    },
  });

  const values = watch();

  const preview =
    useDepreciationPreview(
      Number(values.purchaseCost ?? 0),
      Number(values.quantity ?? 0),
      Number(values.usefulLifeMonths ?? 0),
      Number(values.salvageValue ?? 0)
    );

  const onSubmit = async (
    data: CreateAssetInput
  ) => {
    try {
      setLoading(true);

      await eventService.create({
        aggregateType:
          financeEventType.ASSET_ADDED,

        aggregateId: nanoid(),

        type:
          mode === "OPENING"
            ? OpeningEventType.OPENING_ASSET
            : financeEventType.ASSET_ADDED,

        payload: {
          ...data,
          assetType:
            mode === "OPENING"
              ? "OPENING"
              : "PURCHASE",
        },

        mode,
      });

      toast.success(
        "Asset added successfully"
      );

      if (mode === "OPENING") {
        reset({
          quantity: 1,
          assetType: "OPENING",
        });

        await onCompleted?.();
      } else {
        router.replace("/assets");
      }
    } catch (error: any) {
      toast.error(
        error?.message ??
          "Failed to create asset"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">

      <PageHeader
        title="Add Asset"
        subtitle={
          mode === "OPENING"
            ? "Register assets owned before business launch"
            : "Record newly purchased assets"
        }
      />

      <GlassCard
        variant="accent"
        className="p-6"
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
        >
          {/* Asset Name */}

          <div>
            <GlassInput
              icon={<Landmark size={18} />}
              placeholder="Asset Name"
              {...register("name")}
            />

            {errors.name && (
              <p className="mt-1 text-sm text-red-400">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Cost + Quantity */}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <GlassInput
                type="number"
                icon={<Coins size={18} />}
                placeholder="Purchase Cost"
                {...register(
                  "purchaseCost",
                  {
                    valueAsNumber: true,
                  }
                )}
              />

              {errors.purchaseCost && (
                <p className="mt-1 text-sm text-red-400">
                  {
                    errors.purchaseCost
                      .message
                  }
                </p>
              )}
            </div>

            <div>
              <GlassInput
                type="number"
                icon={<Package size={18} />}
                placeholder="Quantity"
                {...register("quantity", {
                  valueAsNumber: true,
                })}
              />

              {errors.quantity && (
                <p className="mt-1 text-sm text-red-400">
                  {
                    errors.quantity
                      .message
                  }
                </p>
              )}
            </div>
          </div>

          {/* Useful Life + Salvage */}

          <div className="grid gap-4 md:grid-cols-2">
            <GlassInput
              type="number"
              icon={<Calendar size={18} />}
              placeholder="Useful Life (Months)"
              {...register(
                "usefulLifeMonths",
                {
                  valueAsNumber: true,
                }
              )}
            />

            <GlassInput
              type="number"
              icon={<Coins size={18} />}
              placeholder="Salvage Value"
              {...register(
                "salvageValue",
                {
                  valueAsNumber: true,
                }
              )}
            />
          </div>

          {/* Preview */}

          {preview && (
            <GlassCard
              variant="elevated"
              className="p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-400">
                    Asset Valuation
                  </p>

                  <h3 className="mt-2 text-2xl font-bold">
                    {formatCurrency(
                      preview.totalCost
                    )}
                  </h3>
                </div>

                <GlassIcon>
                  <Calculator size={20} />
                </GlassIcon>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400">
                    Total Cost
                  </p>

                  <p className="mt-1 font-semibold">
                    {formatCurrency(
                      preview.totalCost
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">
                    Monthly Depreciation
                  </p>

                  <p className="mt-1 font-semibold text-amber-400">
                    {formatCurrency(
                      preview.monthlyDepreciation
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                <TrendingDown size={14} />

                Straight-line depreciation
                projection
              </div>
            </GlassCard>
          )}

          {/* Action */}

          <GlassButton
            type="submit"
            className="w-full"
            disabled={loading}
            icon={<Landmark size={18} />}
          >
            {loading
              ? "Creating Asset..."
              : "Create Asset"}
          </GlassButton>
        </form>
      </GlassCard>
    </div>
  );
}