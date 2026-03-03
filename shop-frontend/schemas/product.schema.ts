// schemas/product.schema.ts
import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sellingPrice: z.number().positive("Selling price must be greater than 0"),
  costPrice: z.number().positive("Cost price must be greater than 0"),
  quantity: z.number().int().positive("Quantity must be greater than 0"),
  model: z.string().optional(),
  imei: z.string().optional(),
  condition: z.string().optional(),
  description: z.string().optional(),
  type: z.enum(["ACCESSORY", "PHONE", "SERVICE", "OTHER"]),
  stockMode: z.enum(["OPENING", "PURCHASE"]).optional(),
  categoryId: z.string().optional(),
  categoryName: z.string().optional(),
  brandId: z.string().optional(),
  brandName: z.string().optional(),
  imageUrl: z.string().optional(),
});