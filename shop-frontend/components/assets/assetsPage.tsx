"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  createAssetSchema,
  CreateAssetInput,
} from "@/schemas/asset.schema";

import { useDepreciationPreview } from "@/hooks/liveDepreciation";
import { formatCurrency } from "@/lib/format";

import { createAssets } from "@/offline/finance/asset/createAsset";

interface AssetsProps {
  mode: "OPENING" | "LIVE";
  onCompleted?: () => Promise<void> | void;
}

export default function AddAssetPage({
  mode,
  onCompleted,
}: AssetsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    watch,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateAssetInput>({
    resolver: zodResolver(createAssetSchema) as any,
    defaultValues: {
      quantity: 1,
      assetType: mode === "OPENING" ? "OPENING" : "PURCHASE",
    },
  });

  const watchValues = watch();

  /**
   * Depreciation Preview
   */
  const preview = useDepreciationPreview(
    Number(watchValues.purchaseCost ?? 0),
    Number(watchValues.quantity ?? 0),
    Number(watchValues.usefulLifeMonths ?? 0),
    Number(watchValues.salvageValue ?? 0)
  );

  /**
   * Submit handler (Offline IndexedDB)
   */
  const onSubmit = async (data: CreateAssetInput) => {
    try {
      setLoading(true);

      const payload: CreateAssetInput = {
        ...data,
        assetType: mode === "OPENING" ? "OPENING" : "PURCHASE",
      };

      await createAssets(payload);

      toast.success("Asset created successfully");

      if (mode === "OPENING") {
        reset({
          quantity: 1,
          assetType: "OPENING",
        });

        if (onCompleted) {
          await onCompleted();
        }
      } else {
        router.push("/assets");
      }

      reset();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Failed to create asset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10">
      <Card className="p-8 space-y-6">

        <h1 className="text-2xl font-semibold">
          Add New Asset
        </h1>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >

          {/* Asset Name */}
          <input
            {...register("name")}
            placeholder="Asset name"
            className="w-full border rounded-xl px-3 h-10"
          />
          {errors.name && (
            <p className="text-red-500 text-sm">
              {errors.name.message}
            </p>
          )}

          {/* Cost + Quantity */}
          <div className="grid grid-cols-2 gap-4">

            <input
              type="number"
              {...register("purchaseCost", {
                valueAsNumber: true,
              })}
              placeholder="Purchase Cost"
              className="border rounded-xl px-3 h-10"
            />

            <input
              type="number"
              {...register("quantity", {
                valueAsNumber: true,
              })}
              placeholder="Quantity"
              className="border rounded-xl px-3 h-10"
            />

          </div>

          {/* Useful Life + Salvage */}
          <div className="grid grid-cols-2 gap-4">

            <input
              type="number"
              {...register("usefulLifeMonths", {
                valueAsNumber: true,
              })}
              placeholder="Useful Life (Months)"
              className="border rounded-xl px-3 h-10"
            />

            <input
              type="number"
              {...register("salvageValue", {
                valueAsNumber: true,
              })}
              placeholder="Salvage Value"
              className="border rounded-xl px-3 h-10"
            />

          </div>

          {/* Depreciation Preview */}
          {preview && (
            <Card
              variant="gradient"
              gradient="from-indigo-500 to-purple-600"
            >
              <div className="text-white space-y-2">

                <p>
                  Total Cost:{" "}
                  {formatCurrency(preview.totalCost)}
                </p>

                <p>
                  Monthly Depreciation:{" "}
                  {formatCurrency(
                    preview.monthlyDepreciation
                  )}
                </p>

              </div>
            </Card>
          )}

          {/* Submit */}
          <Button
            type="submit"
            fullWidth
            disabled={loading}
          >
            {loading
              ? "Creating..."
              : "Create Asset"}
          </Button>

        </form>

      </Card>
    </div>
  );
}