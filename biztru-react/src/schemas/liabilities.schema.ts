// schemas/liability.schema.ts
import { z } from "zod";

export const createLiabilitySchema = z.object({
  title: z.string().min(2, { message: "Title is required" }),
  type: z.string().min(2, { message: "Type is required" }),
  principalAmount: z.coerce
    .number({ message: "Principal amount must be a number" })
    .positive({ message: "Principal amount must be greater than 0" }),
  interestRate: z
    .coerce.number()
    .nonnegative({ message: "Interest rate must be 0 or more" })
    .optional()
    .default(0),
  startDate: z.preprocess(
    (val) => (val ? new Date(val as string) : new Date()),
    z.date()
  ),
  dueDate: z.preprocess(
    (val) => (val ? new Date(val as string) : null),
    z.date().nullable()
  ).optional(),
});

export type CreateLiabilityInput = z.infer<typeof createLiabilitySchema>;