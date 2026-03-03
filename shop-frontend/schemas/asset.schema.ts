import { z } from "zod";

export const createAssetSchema = z.object({
  name: z.string().min(2, "Asset name is required"),
  description: z.string().optional(),
  purchaseCost: z.coerce.number().positive(),
  quantity: z.coerce.number().int().positive(),
  usefulLifeMonths: z.coerce.number().int().positive(),
  salvageValue: z.coerce.number().min(0).optional(),
  purchaseDate: z.string().optional(),
  assetType: z.enum(["OPENING", "PURCHASE"]),
});

export type CreateAssetInput = z.infer<typeof createAssetSchema>;